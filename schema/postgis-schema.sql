-- =====================================================================
-- GeoCore GIS — สคริปต์สร้างฐานข้อมูล (PostgreSQL 16 + PostGIS 3.4)
-- ระบบสารสนเทศภูมิศาสตร์สำหรับองค์กรปกครองส่วนท้องถิ่น
--
-- หลักการออกแบบ
--   1. ทุกชั้นข้อมูลใช้ "ชุดฟิลด์มาตรฐาน" ชุดเดียวกัน (DOMAIN + ตาราง template)
--   2. จัดเก็บรูปทรงใน EPSG:4326 และคำนวณระยะ/พื้นที่ด้วย geography หรือ EPSG:32647
--   3. แยกเจ้าของทรัพย์สิน ผู้บำรุงรักษา และสถานะการยืนยันออกจากกัน
--   4. บันทึกการเปลี่ยนแปลงทุกแถวด้วย trigger ลงสคีมา audit (append-only)
--   5. ควบคุมการเข้าถึงด้วย Row Level Security ตามกลุ่มสิทธิ์และขอบเขตชั้นข้อมูล
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_raster;
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS pg_trgm;       -- ค้นหาข้อความภาษาไทยแบบคล้ายคลึง

CREATE SCHEMA IF NOT EXISTS gis;    -- ชั้นข้อมูลเชิงพื้นที่
CREATE SCHEMA IF NOT EXISTS ref;    -- ตารางค่าอ้างอิงและทะเบียนชั้นข้อมูล
CREATE SCHEMA IF NOT EXISTS app;    -- ผู้ใช้งาน สิทธิ์ ไฟล์แนบ การส่งออก
CREATE SCHEMA IF NOT EXISTS qc;     -- กฎและผลการตรวจคุณภาพ
CREATE SCHEMA IF NOT EXISTS audit;  -- บันทึกการเปลี่ยนแปลงและการเข้าถึง
CREATE SCHEMA IF NOT EXISTS plan;   -- ตัวชี้วัดและโครงการที่อ้างอิงพื้นที่

-- =====================================================================
-- 1. โดเมนและตารางค่าอ้างอิง
-- =====================================================================

CREATE DOMAIN ref.feature_code     AS varchar(32)
  CHECK (VALUE ~ '^[A-Z]{2,3}-[0-9]{3,6}$');
CREATE DOMAIN ref.confirm_status   AS varchar(16)
  CHECK (VALUE IN ('confirmed','pending','conflict','unknown'));
CREATE DOMAIN ref.record_status    AS varchar(16)
  CHECK (VALUE IN ('draft','submitted','approved','rejected','retired'));
CREATE DOMAIN ref.sensitivity      AS varchar(16)
  CHECK (VALUE IN ('public','internal','confidential','restricted'));
CREATE DOMAIN ref.source_type      AS varchar(24)
  CHECK (VALUE IN ('field_survey','aerial','agency_doc','citizen_report','legacy'));

CREATE TABLE ref.agency (
  agency_id     smallserial PRIMARY KEY,
  agency_code   varchar(16)  NOT NULL UNIQUE,
  name_th       varchar(255) NOT NULL,
  abbr_th       varchar(32)  NOT NULL,
  agency_level  varchar(24)  NOT NULL,     -- central / provincial / local / private / unknown
  contact_note  text,
  is_active     boolean      NOT NULL DEFAULT true
);
COMMENT ON TABLE ref.agency IS 'หน่วยงานเจ้าของทรัพย์สินหรือผู้บำรุงรักษา';

CREATE TABLE ref.village (
  village_code  varchar(16) PRIMARY KEY,
  name_th       varchar(128) NOT NULL,
  moo_no        smallint,
  geom          geometry(MultiPolygon, 4326)
);

-- ตารางค่าอ้างอิงรวม: ใช้กับทุกฟิลด์รหัส เพื่อให้เพิ่มค่าใหม่ได้โดยไม่ต้องแก้โครงสร้าง
CREATE TABLE ref.code_domain (
  domain_name  varchar(48)  NOT NULL,   -- เช่น road_surface, light_type
  code         varchar(32)  NOT NULL,
  label_th     varchar(128) NOT NULL,
  label_en     varchar(128),
  sort_order   smallint     NOT NULL DEFAULT 0,
  is_active    boolean      NOT NULL DEFAULT true,
  PRIMARY KEY (domain_name, code)
);

-- ทะเบียนชั้นข้อมูล — ควบคุมว่าในระบบมีชั้นข้อมูลใดบ้าง
CREATE TABLE ref.layer_registry (
  layer_code          varchar(8)   PRIMARY KEY,
  name_th             varchar(128) NOT NULL,
  name_en             varchar(128),
  table_name          varchar(128) NOT NULL,
  geometry_type       varchar(32)  NOT NULL,
  layer_group         varchar(64),
  is_new_layer        boolean      NOT NULL DEFAULT true,   -- true = ชั้นข้อมูลที่จัดทำใหม่
  target_accuracy_m   numeric(5,2),
  update_cycle_months smallint,
  custodian_unit      varchar(128),
  default_sensitivity ref.sensitivity NOT NULL DEFAULT 'internal',
  publishable         boolean      NOT NULL DEFAULT true,   -- false = ตัดออกจากชุดเผยแพร่เสมอ
  style_json          jsonb,
  description         text
);
COMMENT ON COLUMN ref.layer_registry.publishable IS
  'false สำหรับชั้นข้อมูลอ่อนไหว เช่น CCTV ซึ่งต้องไม่ปรากฏในชุดเผยแพร่สาธารณะ';

-- =====================================================================
-- 2. ผู้ใช้งานและสิทธิ์
-- =====================================================================

CREATE TABLE app.user_account (
  user_uid     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_code    varchar(16)  NOT NULL UNIQUE,
  display_name varchar(128) NOT NULL,
  email        varchar(255) NOT NULL UNIQUE,
  oidc_subject varchar(255) UNIQUE,          -- ไม่เก็บรหัสผ่านเมื่อใช้ SSO
  password_hash text,                        -- argon2id สำหรับบัญชีสำรองเท่านั้น
  org_unit     varchar(128),
  mfa_enabled  boolean     NOT NULL DEFAULT false,
  is_active    boolean     NOT NULL DEFAULT true,
  expires_on   date,                         -- บังคับสำหรับผู้ใช้งานภายนอก
  last_login_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE app.role (
  role_code   varchar(16) PRIMARY KEY,   -- viewer | editor | both | admin
  name_th     varchar(64) NOT NULL,
  name_en     varchar(64) NOT NULL,
  description text
);

CREATE TABLE app.permission (
  permission_code varchar(48) PRIMARY KEY, -- เช่น feature.create, feature.approve
  permission_group varchar(64) NOT NULL,
  description     text
);

CREATE TABLE app.role_permission (
  role_code       varchar(16) REFERENCES app.role(role_code) ON DELETE CASCADE,
  permission_code varchar(48) REFERENCES app.permission(permission_code) ON DELETE CASCADE,
  scope           varchar(16) NOT NULL DEFAULT 'all',  -- all | own
  PRIMARY KEY (role_code, permission_code)
);

CREATE TABLE app.user_role (
  user_uid   uuid        REFERENCES app.user_account(user_uid) ON DELETE CASCADE,
  role_code  varchar(16) REFERENCES app.role(role_code),
  granted_by uuid        REFERENCES app.user_account(user_uid),
  granted_at timestamptz NOT NULL DEFAULT now(),
  expires_on date,
  PRIMARY KEY (user_uid, role_code)
);

-- ขอบเขตชั้นข้อมูลและพื้นที่ที่ผู้ใช้แต่ละคนเข้าถึงได้
CREATE TABLE app.user_layer_scope (
  user_uid    uuid        REFERENCES app.user_account(user_uid) ON DELETE CASCADE,
  layer_code  varchar(8)  REFERENCES ref.layer_registry(layer_code),
  can_write   boolean     NOT NULL DEFAULT false,
  area_filter geometry(MultiPolygon, 4326),   -- NULL = ทั้งพื้นที่
  reason      text,                           -- บังคับระบุสำหรับชั้นข้อมูลอ่อนไหว
  PRIMARY KEY (user_uid, layer_code)
);

-- =====================================================================
-- 3. ชุดฟิลด์มาตรฐานของทุกชั้นข้อมูล
--    ใช้ตาราง template แล้ว INHERITS ไม่ได้กับ PK/FK จึงใช้วิธีประกาศซ้ำผ่าน
--    ฟังก์ชันช่วยสร้าง เพื่อให้ทุกตารางมีฟิลด์เหมือนกันโดยไม่ลืม
-- =====================================================================

CREATE OR REPLACE FUNCTION gis.add_core_columns(p_table regclass)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format($f$
    ALTER TABLE %s
      ADD COLUMN IF NOT EXISTS feature_uid           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      ADD COLUMN IF NOT EXISTS feature_code          ref.feature_code NOT NULL,
      ADD COLUMN IF NOT EXISTS layer_code            varchar(8) NOT NULL REFERENCES ref.layer_registry(layer_code),
      ADD COLUMN IF NOT EXISTS name_th               varchar(255),
      ADD COLUMN IF NOT EXISTS description           text,
      ADD COLUMN IF NOT EXISTS owner_agency_id       smallint REFERENCES ref.agency(agency_id),
      ADD COLUMN IF NOT EXISTS maintainer_agency_id  smallint REFERENCES ref.agency(agency_id),
      ADD COLUMN IF NOT EXISTS confirm_status_code   ref.confirm_status NOT NULL DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS source_ref            text NOT NULL,
      ADD COLUMN IF NOT EXISTS source_type_code      ref.source_type NOT NULL,
      ADD COLUMN IF NOT EXISTS surveyed_on           date NOT NULL,
      ADD COLUMN IF NOT EXISTS positional_accuracy_m numeric(5,2),
      ADD COLUMN IF NOT EXISTS record_status_code    ref.record_status NOT NULL DEFAULT 'draft',
      ADD COLUMN IF NOT EXISTS sensitivity_code      ref.sensitivity NOT NULL DEFAULT 'internal',
      ADD COLUMN IF NOT EXISTS is_public             boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS village_code          varchar(16) REFERENCES ref.village(village_code),
      ADD COLUMN IF NOT EXISTS created_at            timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS created_by            uuid REFERENCES app.user_account(user_uid),
      ADD COLUMN IF NOT EXISTS updated_at            timestamptz NOT NULL DEFAULT now(),
      ADD COLUMN IF NOT EXISTS updated_by            uuid REFERENCES app.user_account(user_uid),
      ADD COLUMN IF NOT EXISTS version_no            integer NOT NULL DEFAULT 1
  $f$, p_table);

  -- รหัสรายการต้องไม่ซ้ำทั้งชั้นข้อมูล (ข้อกำหนด: ทุกรายการมีรหัสไม่ซ้ำ)
  EXECUTE format('CREATE UNIQUE INDEX IF NOT EXISTS %I ON %s (feature_code)',
                 'uq_' || replace(p_table::text, '.', '_') || '_code', p_table);
  -- วันที่สำรวจต้องไม่เป็นอนาคต (กฎ QC-10 บังคับที่ระดับฐานข้อมูล)
  EXECUTE format('ALTER TABLE %s ADD CONSTRAINT %I CHECK (surveyed_on <= CURRENT_DATE)',
                 p_table, 'ck_' || replace(p_table::text, '.', '_') || '_surveyed');
  -- ระบุเจ้าของ หรือยอมรับได้เฉพาะเมื่อสถานะเป็น "รอยืนยัน"/"ขัดแย้ง"
  EXECUTE format($f$ALTER TABLE %s ADD CONSTRAINT %I
      CHECK (owner_agency_id IS NOT NULL OR confirm_status_code IN ('pending','conflict','unknown'))$f$,
      p_table, 'ck_' || replace(p_table::text, '.', '_') || '_owner');
END $$;

-- =====================================================================
-- 4. ชั้นข้อมูลเชิงพื้นที่ (L01–L10)
-- =====================================================================

-- ---- L01 ถนน -------------------------------------------------------
CREATE TABLE gis.road (
  road_class_code  varchar(16) NOT NULL,
  surface_code     varchar(16) NOT NULL,
  condition_code   varchar(16),
  width_m          numeric(5,2) CHECK (width_m > 0),
  row_width_m      numeric(5,2),
  start_point_desc varchar(255),
  end_point_desc   varchar(255),
  has_drainage     boolean NOT NULL DEFAULT false,
  ownership_note   text,
  geom             geometry(MultiLineString, 4326) NOT NULL,
  length_m         numeric(10,2)
    GENERATED ALWAYS AS (ST_Length(geom::geography)) STORED
);
SELECT gis.add_core_columns('gis.road');

-- ---- L02 ไฟส่องสว่าง -----------------------------------------------
CREATE TABLE gis.street_light (
  light_type_code   varchar(16) NOT NULL,
  wattage           smallint CHECK (wattage BETWEEN 1 AND 2000),
  pole_type_code    varchar(16),
  arm_count         smallint NOT NULL DEFAULT 1,
  status_code       varchar(16) NOT NULL,
  power_source_code varchar(16),
  road_uid          uuid REFERENCES gis.road(feature_uid),
  chainage_m        numeric(10,2),
  last_repair_on    date,
  geom              geometry(Point, 4326) NOT NULL
);
SELECT gis.add_core_columns('gis.street_light');

-- ---- L03 CCTV (ชั้นข้อมูลอ่อนไหว) -----------------------------------
CREATE TABLE gis.cctv (
  camera_type_code varchar(16) NOT NULL,
  status_code      varchar(16) NOT NULL,
  view_azimuth_deg smallint CHECK (view_azimuth_deg BETWEEN 0 AND 359),
  view_range_m     numeric(6,2),
  mount_height_m   numeric(4,2),
  road_uid         uuid REFERENCES gis.road(feature_uid),
  install_year     smallint,
  geom             geometry(Point, 4326) NOT NULL
);
SELECT gis.add_core_columns('gis.cctv');
-- ข้อกำหนด: ไม่บันทึกรหัสผ่านหรือข้อมูลเชื่อมต่อ และต้องไม่อยู่ในชุดเผยแพร่
ALTER TABLE gis.cctv
  ADD CONSTRAINT ck_cctv_not_public CHECK (is_public = false),
  ADD CONSTRAINT ck_cctv_sensitivity CHECK (sensitivity_code IN ('confidential','restricted'));

-- ---- L04 สะพาน ------------------------------------------------------
CREATE TABLE gis.bridge (
  structure_code  varchar(16) NOT NULL,
  span_length_m   numeric(6,2),
  deck_width_m    numeric(5,2),
  load_limit_ton  numeric(5,1),
  condition_code  varchar(16),
  road_uid        uuid REFERENCES gis.road(feature_uid),
  chainage_m      numeric(10,2),
  crosses_feature varchar(255),
  inspection_note text,
  geom            geometry(Point, 4326) NOT NULL
);
SELECT gis.add_core_columns('gis.bridge');
COMMENT ON COLUMN gis.bridge.condition_code IS
  'สภาพจากการสำรวจเบื้องต้นเท่านั้น ไม่ใช้แทนการตรวจโครงสร้างโดยวิศวกร';

-- ---- L05 แหล่งน้ำและระบบประปา (3 ตาราง) ------------------------------
CREATE TABLE gis.water_facility (
  facility_type_code varchar(24) NOT NULL,
  capacity_m3        numeric(10,2),
  status_code        varchar(16) NOT NULL,
  service_village    varchar(128),
  household_served   integer,
  operator_agency_id smallint REFERENCES ref.agency(agency_id),
  geom               geometry(Point, 4326) NOT NULL
);
SELECT gis.add_core_columns('gis.water_facility');

CREATE TABLE gis.water_pipe (
  pipe_material_code varchar(16),
  diameter_mm        smallint,
  install_year       smallint,
  status_code        varchar(16) NOT NULL,
  geom               geometry(MultiLineString, 4326) NOT NULL,
  length_m           numeric(10,2) GENERATED ALWAYS AS (ST_Length(geom::geography)) STORED
);
SELECT gis.add_core_columns('gis.water_pipe');

CREATE TABLE gis.water_body (
  body_type_code varchar(24) NOT NULL,   -- reservoir / pond / canal / weir
  usable_volume_m3 numeric(12,2),
  geom           geometry(MultiPolygon, 4326) NOT NULL,
  area_sqm       numeric(14,2) GENERATED ALWAYS AS (ST_Area(geom::geography)) STORED
);
SELECT gis.add_core_columns('gis.water_body');

-- ---- L06 ทางระบายน้ำและจุดปัญหา --------------------------------------
CREATE TABLE gis.drainage_line (
  drain_type_code varchar(24) NOT NULL,  -- open_ditch / covered / canal / pipe
  width_m         numeric(5,2),
  flow_direction  varchar(16),
  condition_code  varchar(16),
  geom            geometry(MultiLineString, 4326) NOT NULL,
  length_m        numeric(10,2) GENERATED ALWAYS AS (ST_Length(geom::geography)) STORED
);
SELECT gis.add_core_columns('gis.drainage_line');

CREATE TABLE gis.drainage_issue (
  issue_type_code    varchar(24) NOT NULL,
  severity_code      varchar(16) NOT NULL,
  frequency_code     varchar(16),
  affected_household integer,
  priority_rank      smallint,
  proposal_uid       uuid,
  resolved_on        date,
  geom               geometry(Point, 4326) NOT NULL
);
SELECT gis.add_core_columns('gis.drainage_issue');

-- ---- L07 พื้นที่สาธารณะและจุดอัตลักษณ์ ---------------------------------
CREATE TABLE gis.public_space (
  space_type_code    varchar(24) NOT NULL,
  current_use        varchar(255),
  caretaker_note     varchar(255),
  all_age_facility   boolean NOT NULL DEFAULT false,
  identity_potential text,
  geom               geometry(MultiPolygon, 4326) NOT NULL,
  area_sqm           numeric(14,2) GENERATED ALWAYS AS (ST_Area(geom::geography)) STORED
);
SELECT gis.add_core_columns('gis.public_space');

CREATE TABLE gis.community_landmark (
  landmark_type_code varchar(24) NOT NULL,
  significance_note  text,
  geom               geometry(Point, 4326) NOT NULL
);
SELECT gis.add_core_columns('gis.community_landmark');

-- ---- L08 แนวเขตและพื้นที่คลาดเคลื่อน ----------------------------------
CREATE TABLE gis.admin_boundary (
  boundary_source_code varchar(32) NOT NULL,  -- ministry_notice / tax_collection / aerial_photo
  effective_from       date,
  is_reference         boolean NOT NULL DEFAULT false,  -- true = แนวเขตอ้างอิงหลัก
  legal_ref            text,
  geom                 geometry(MultiPolygon, 4326) NOT NULL
);
SELECT gis.add_core_columns('gis.admin_boundary');
-- มีแนวเขตอ้างอิงหลักได้เพียงรายการเดียว
CREATE UNIQUE INDEX uq_boundary_reference ON gis.admin_boundary (is_reference)
  WHERE is_reference;

CREATE TABLE gis.boundary_discrepancy (
  discrepancy_type_code  varchar(24) NOT NULL,  -- overlap / gap / misalignment
  reference_boundary_uid uuid NOT NULL REFERENCES gis.admin_boundary(feature_uid),
  actual_boundary_uid    uuid NOT NULL REFERENCES gis.admin_boundary(feature_uid),
  parcel_count           integer,
  building_count         integer,
  resolution_status_code varchar(16) NOT NULL DEFAULT 'conflict',
  coordination_evidence  text,
  geom                   geometry(MultiPolygon, 4326) NOT NULL,
  area_rai               numeric(12,2)
    GENERATED ALWAYS AS (ST_Area(geom::geography) / 1600.0) STORED
);
SELECT gis.add_core_columns('gis.boundary_discrepancy');

-- ---- L09 / L10 ชั้นข้อมูลเดิมที่เชื่อมโยง ------------------------------
CREATE TABLE gis.land_parcel (
  parcel_no       varchar(32) NOT NULL UNIQUE,
  land_use_code   varchar(24),
  area_rai        numeric(12,3),
  tax_account_ref varchar(32),
  geom            geometry(MultiPolygon, 4326) NOT NULL
);
SELECT gis.add_core_columns('gis.land_parcel');

CREATE TABLE gis.building (
  building_no       varchar(32) NOT NULL UNIQUE,
  parcel_uid        uuid REFERENCES gis.land_parcel(feature_uid),
  building_type_code varchar(24),
  storey_count      smallint,
  floor_area_sqm    numeric(10,2),
  house_no_masked   varchar(16),
  geom              geometry(MultiPolygon, 4326) NOT NULL
);
SELECT gis.add_core_columns('gis.building');

-- =====================================================================
-- 5. ดัชนี
-- =====================================================================
CREATE INDEX idx_road_geom        ON gis.road        USING GIST (geom);
CREATE INDEX idx_light_geom       ON gis.street_light USING GIST (geom);
CREATE INDEX idx_cctv_geom        ON gis.cctv        USING GIST (geom);
CREATE INDEX idx_bridge_geom      ON gis.bridge      USING GIST (geom);
CREATE INDEX idx_wfac_geom        ON gis.water_facility USING GIST (geom);
CREATE INDEX idx_wpipe_geom       ON gis.water_pipe  USING GIST (geom);
CREATE INDEX idx_wbody_geom       ON gis.water_body  USING GIST (geom);
CREATE INDEX idx_dline_geom       ON gis.drainage_line USING GIST (geom);
CREATE INDEX idx_dissue_geom      ON gis.drainage_issue USING GIST (geom);
CREATE INDEX idx_pspace_geom      ON gis.public_space USING GIST (geom);
CREATE INDEX idx_landmark_geom    ON gis.community_landmark USING GIST (geom);
CREATE INDEX idx_boundary_geom    ON gis.admin_boundary USING GIST (geom);
CREATE INDEX idx_discrep_geom     ON gis.boundary_discrepancy USING GIST (geom);
CREATE INDEX idx_parcel_geom      ON gis.land_parcel USING GIST (geom);
CREATE INDEX idx_building_geom    ON gis.building    USING GIST (geom);

CREATE INDEX idx_road_owner   ON gis.road (owner_agency_id, confirm_status_code);
CREATE INDEX idx_road_status  ON gis.road (record_status_code) WHERE record_status_code <> 'retired';
CREATE INDEX idx_road_name_tg ON gis.road USING GIN (name_th gin_trgm_ops);
CREATE INDEX idx_light_road   ON gis.street_light (road_uid);
CREATE INDEX idx_light_status ON gis.street_light (status_code);

-- =====================================================================
-- 6. Trigger: ปรับ updated_at/version_no และบันทึกประวัติ
-- =====================================================================
CREATE TABLE audit.change_log (
  log_id       bigserial PRIMARY KEY,
  occurred_at  timestamptz NOT NULL DEFAULT now(),
  actor_uid    uuid,
  actor_role   varchar(16),
  action       varchar(16) NOT NULL,
  schema_name  varchar(64) NOT NULL,
  table_name   varchar(64) NOT NULL,
  record_pk    uuid,
  old_values   jsonb,
  new_values   jsonb,
  changed_cols text[],
  client_ip    inet,
  user_agent   text,
  request_id   uuid
);
CREATE INDEX idx_changelog_time   ON audit.change_log (occurred_at DESC);
CREATE INDEX idx_changelog_record ON audit.change_log (table_name, record_pk);
CREATE INDEX idx_changelog_actor  ON audit.change_log (actor_uid, occurred_at DESC);

CREATE TABLE audit.access_log (
  access_id   bigserial PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  actor_uid   uuid,
  action      varchar(24) NOT NULL,   -- LOGIN / EXPORT / PUBLISH / VIEW_SENSITIVE
  object_ref  text,
  detail      jsonb,
  client_ip   inet
);

CREATE OR REPLACE FUNCTION audit.log_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_old jsonb := CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE to_jsonb(OLD) END;
  v_new jsonb := CASE WHEN TG_OP = 'DELETE' THEN NULL ELSE to_jsonb(NEW) END;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    NEW.updated_at := now();
    NEW.version_no := OLD.version_no + 1;
    NEW.updated_by := nullif(current_setting('app.current_user', true), '')::uuid;
  ELSIF TG_OP = 'INSERT' THEN
    NEW.created_by := coalesce(NEW.created_by,
                               nullif(current_setting('app.current_user', true), '')::uuid);
  END IF;

  INSERT INTO audit.change_log(actor_uid, actor_role, action, schema_name, table_name,
                               record_pk, old_values, new_values, changed_cols,
                               client_ip, request_id)
  VALUES (nullif(current_setting('app.current_user', true), '')::uuid,
          nullif(current_setting('app.current_role_code', true), ''),
          TG_OP, TG_TABLE_SCHEMA, TG_TABLE_NAME,
          coalesce((v_new ->> 'feature_uid')::uuid, (v_old ->> 'feature_uid')::uuid),
          v_old - 'geom', v_new - 'geom',
          CASE WHEN TG_OP = 'UPDATE' THEN
            ARRAY(SELECT key FROM jsonb_each(v_new) WHERE v_new -> key IS DISTINCT FROM v_old -> key)
          END,
          nullif(current_setting('app.client_ip', true), '')::inet,
          nullif(current_setting('app.request_id', true), '')::uuid);

  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;

-- ผูก trigger กับทุกตารางในสคีมา gis
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT schemaname, tablename FROM pg_tables WHERE schemaname = 'gis' LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_audit_%1$s BEFORE INSERT OR UPDATE OR DELETE ON %2$I.%1$I
         FOR EACH ROW EXECUTE FUNCTION audit.log_change()', t.tablename, t.schemaname);
  END LOOP;
END $$;

-- บันทึกการใช้งานแก้ไขหรือลบไม่ได้ แม้แต่ผู้ดูแลระบบ
REVOKE UPDATE, DELETE, TRUNCATE ON audit.change_log, audit.access_log FROM PUBLIC;

-- =====================================================================
-- 7. การตรวจคุณภาพข้อมูล
-- =====================================================================
CREATE TABLE qc.qc_rule (
  rule_code     varchar(16) PRIMARY KEY,
  category      varchar(32) NOT NULL,
  name_th       varchar(255) NOT NULL,
  scope_layers  text[],
  severity      varchar(16) NOT NULL CHECK (severity IN ('critical','serious','warning')),
  check_sql     text NOT NULL,
  is_active     boolean NOT NULL DEFAULT true
);

CREATE TABLE qc.qc_run (
  run_id        bigserial PRIMARY KEY,
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz,
  triggered_by  uuid REFERENCES app.user_account(user_uid),
  scope_layers  text[],
  checked_count integer,
  finding_count integer
);

CREATE TABLE qc.qc_finding (
  finding_id   bigserial PRIMARY KEY,
  run_id       bigint REFERENCES qc.qc_run(run_id) ON DELETE CASCADE,
  rule_code    varchar(16) REFERENCES qc.qc_rule(rule_code),
  layer_code   varchar(8)  REFERENCES ref.layer_registry(layer_code),
  feature_uid  uuid,
  feature_code varchar(32),
  severity     varchar(16) NOT NULL,
  message      text NOT NULL,
  geom         geometry(Point, 4326),
  assignee_uid uuid REFERENCES app.user_account(user_uid),
  state        varchar(16) NOT NULL DEFAULT 'open'
                 CHECK (state IN ('open','fixing','fixed','waived')),
  waiver_reason text,
  resolved_at  timestamptz
);
CREATE INDEX idx_finding_open ON qc.qc_finding (state, severity) WHERE state IN ('open','fixing');

-- =====================================================================
-- 8. ไฟล์แนบ การสำรวจ การส่งออก และการเผยแพร่
-- =====================================================================
CREATE TABLE app.survey_session (
  session_uid   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  surveyor_uid  uuid REFERENCES app.user_account(user_uid),
  layer_code    varchar(8) REFERENCES ref.layer_registry(layer_code),
  area_geom     geometry(MultiPolygon, 4326),
  device_info   jsonb,
  accuracy_target_m numeric(5,2),
  started_at    timestamptz NOT NULL DEFAULT now(),
  finished_at   timestamptz
);

CREATE TABLE app.attachment (
  attachment_uid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_uid    uuid NOT NULL,
  layer_code     varchar(8) REFERENCES ref.layer_registry(layer_code),
  file_name      varchar(255) NOT NULL,
  content_type   varchar(128) NOT NULL,
  byte_size      bigint NOT NULL CHECK (byte_size <= 15 * 1024 * 1024),
  storage_key    text NOT NULL,          -- คีย์บน object storage
  sha256         char(64) NOT NULL,
  exif_taken_at  timestamptz,
  exif_geom      geometry(Point, 4326),
  uploaded_by    uuid REFERENCES app.user_account(user_uid),
  uploaded_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_attachment_feature ON app.attachment (feature_uid);

CREATE TABLE app.citizen_proposal (
  proposal_uid  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_code varchar(16) NOT NULL UNIQUE,
  channel_code  varchar(24) NOT NULL,   -- public_forum / online_survey / walk_in / web
  topic_code    varchar(32),
  detail        text NOT NULL,
  village_code  varchar(16) REFERENCES ref.village(village_code),
  geom          geometry(Point, 4326),
  status_code   varchar(16) NOT NULL DEFAULT 'received',
  assignee_uid  uuid REFERENCES app.user_account(user_uid),
  received_on   date NOT NULL,
  resolved_on   date
  -- หมายเหตุ: ไม่จัดเก็บชื่อหรือข้อมูลติดต่อของผู้เสนอในตารางนี้ (PDPA)
);

CREATE TABLE app.publication_profile (
  profile_code    varchar(24) PRIMARY KEY,
  name_th         varchar(128) NOT NULL,
  excluded_layers text[],
  excluded_fields jsonb,                 -- {"gis.road": ["ownership_note","source_ref"], …}
  min_record_status varchar(16) NOT NULL DEFAULT 'approved'
);

CREATE TABLE app.publication (
  publication_uid uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_label   varchar(32) NOT NULL UNIQUE,
  profile_code    varchar(24) REFERENCES app.publication_profile(profile_code),
  created_by      uuid REFERENCES app.user_account(user_uid),
  created_at      timestamptz NOT NULL DEFAULT now(),
  layer_count     smallint,
  record_count    integer,
  manifest        jsonb,
  is_current      boolean NOT NULL DEFAULT false
);

CREATE TABLE app.export_job (
  export_uid   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid REFERENCES app.user_account(user_uid),
  formats      text[] NOT NULL,
  scope        jsonb NOT NULL,
  status       varchar(16) NOT NULL DEFAULT 'queued'
                 CHECK (status IN ('queued','running','done','failed')),
  byte_size    bigint,
  manifest     jsonb,
  error_detail text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz NOT NULL DEFAULT now() + interval '24 hours'
);

-- =====================================================================
-- 9. ตัวชี้วัดและโครงการ
-- =====================================================================
CREATE TABLE plan.kpi_indicator (
  kpi_code     varchar(16) PRIMARY KEY,
  name_th      varchar(255) NOT NULL,
  unit         varchar(16),
  target_value numeric(12,2),
  cycle_code   varchar(16),
  owner_unit   varchar(128),
  calc_sql     text            -- NULL = บันทึกค่าด้วยมือ
);

CREATE TABLE plan.kpi_value (
  kpi_code    varchar(16) REFERENCES plan.kpi_indicator(kpi_code),
  period_start date NOT NULL,
  value        numeric(12,2) NOT NULL,
  recorded_by  uuid REFERENCES app.user_account(user_uid),
  recorded_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (kpi_code, period_start)
);

CREATE TABLE plan.project (
  project_uid   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_code  varchar(24) NOT NULL UNIQUE,
  name_th       varchar(255) NOT NULL,
  strategy_code varchar(24),
  budget_baht   numeric(14,2),
  funding_source varchar(128),
  owner_unit    varchar(128),
  start_year    smallint,
  end_year      smallint,
  status_code   varchar(16) NOT NULL DEFAULT 'proposed'
);

-- เชื่อมโครงการกับรายการข้อมูลเชิงพื้นที่ที่โครงการนั้นดำเนินการ
CREATE TABLE plan.project_feature (
  project_uid uuid REFERENCES plan.project(project_uid) ON DELETE CASCADE,
  layer_code  varchar(8) REFERENCES ref.layer_registry(layer_code),
  feature_uid uuid NOT NULL,
  relation    varchar(24) NOT NULL DEFAULT 'target',
  PRIMARY KEY (project_uid, feature_uid)
);

-- =====================================================================
-- 10. มุมมองสำหรับการใช้งานและการเผยแพร่
-- =====================================================================

-- มุมมองรวมทุกชั้นข้อมูลแบบย่อ สำหรับการค้นหาข้ามชั้นข้อมูล
CREATE OR REPLACE VIEW gis.v_feature_index AS
  SELECT feature_uid, feature_code, layer_code, name_th, owner_agency_id,
         confirm_status_code, record_status_code, is_public, updated_at,
         ST_PointOnSurface(ST_Force2D(geom))::geometry(Point,4326) AS locator
  FROM gis.road
  UNION ALL SELECT feature_uid, feature_code, layer_code, name_th, owner_agency_id,
         confirm_status_code, record_status_code, is_public, updated_at, geom
  FROM gis.street_light
  UNION ALL SELECT feature_uid, feature_code, layer_code, name_th, owner_agency_id,
         confirm_status_code, record_status_code, is_public, updated_at, geom
  FROM gis.bridge;
  -- (ต่อด้วยชั้นข้อมูลอื่นในสคริปต์ฉบับเต็ม)

-- มุมมองชุดเผยแพร่: ตัดฟิลด์อ่อนไหวและรับเฉพาะรายการที่อนุมัติแล้ว
CREATE OR REPLACE VIEW gis.v_road_public AS
  SELECT feature_uid, feature_code, layer_code, name_th,
         road_class_code, surface_code, condition_code, length_m, width_m,
         owner_agency_id, maintainer_agency_id, confirm_status_code,
         source_type_code, surveyed_on, geom
  FROM gis.road
  WHERE record_status_code = 'approved' AND is_public;
-- หมายเหตุ: ไม่มี ownership_note, source_ref, created_by, updated_by ในมุมมองนี้

-- มุมมองทรัพย์สินบนถนนแต่ละสาย (ใช้ในหน้าวิเคราะห์)
CREATE OR REPLACE VIEW gis.v_road_assets AS
  SELECT r.feature_uid AS road_uid, r.feature_code AS road_code, r.name_th,
         r.length_m,
         count(DISTINCT l.feature_uid) AS light_count,
         count(DISTINCT c.feature_uid) AS cctv_count,
         count(DISTINCT b.feature_uid) AS bridge_count,
         round(r.length_m / NULLIF(count(DISTINCT l.feature_uid), 0), 1) AS metres_per_light
  FROM gis.road r
  LEFT JOIN gis.street_light l ON l.road_uid = r.feature_uid
  LEFT JOIN gis.cctv         c ON c.road_uid = r.feature_uid
  LEFT JOIN gis.bridge       b ON b.road_uid = r.feature_uid
  GROUP BY r.feature_uid, r.feature_code, r.name_th, r.length_m;

-- =====================================================================
-- 11. ตัวอย่างการวิเคราะห์เชิงพื้นที่ที่ใช้จริง
-- =====================================================================

-- 11.1 ทรัพย์สินที่อยู่ห่างแนวถนนเกิน 25 เมตร (กฎ QC-07)
-- SELECT l.feature_code, r.feature_code,
--        round(ST_Distance(l.geom::geography, r.geom::geography)::numeric, 1) AS dist_m
-- FROM gis.street_light l
-- JOIN gis.road r ON r.feature_uid = l.road_uid
-- WHERE NOT ST_DWithin(l.geom::geography, r.geom::geography, 25);

-- 11.2 พื้นที่คลาดเคลื่อนระหว่างแนวเขตอ้างอิงกับแนวเขตจัดเก็บจริง
-- SELECT ST_Area(ST_SymDifference(a.geom, b.geom)::geography) / 1600 AS area_rai
-- FROM gis.admin_boundary a, gis.admin_boundary b
-- WHERE a.is_reference AND b.boundary_source_code = 'tax_collection';

-- 11.3 Vector tile สำหรับแสดงผลบนเว็บและมือถือ
-- SELECT ST_AsMVT(t, 'road', 4096, 'geom') FROM (
--   SELECT feature_code, name_th, road_class_code,
--          ST_AsMVTGeom(ST_Transform(geom, 3857),
--                       ST_TileEnvelope(:z, :x, :y), 4096, 64, true) AS geom
--   FROM gis.road
--   WHERE geom && ST_Transform(ST_TileEnvelope(:z, :x, :y), 4326)
-- ) t;

-- =====================================================================
-- 12. Row Level Security ตามขอบเขตสิทธิ์ของผู้ใช้
-- =====================================================================
ALTER TABLE gis.road         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gis.street_light ENABLE ROW LEVEL SECURITY;
ALTER TABLE gis.cctv         ENABLE ROW LEVEL SECURITY;

-- อ่านได้เมื่อผู้ใช้มีสิทธิ์ในชั้นข้อมูลนั้น และอยู่ในขอบเขตพื้นที่ที่กำหนด
CREATE POLICY p_road_select ON gis.road FOR SELECT USING (
  EXISTS (SELECT 1 FROM app.user_layer_scope s
          WHERE s.user_uid = nullif(current_setting('app.current_user', true), '')::uuid
            AND s.layer_code = 'L01'
            AND (s.area_filter IS NULL OR ST_Intersects(gis.road.geom, s.area_filter)))
);

-- ผู้ป้อนข้อมูลแก้ไขได้เฉพาะรายการของตนเองที่ยังเป็น "ร่าง"
CREATE POLICY p_road_update_own ON gis.road FOR UPDATE USING (
  current_setting('app.current_role_code', true) IN ('both','admin')
  OR (current_setting('app.current_role_code', true) = 'editor'
      AND created_by = nullif(current_setting('app.current_user', true), '')::uuid
      AND record_status_code = 'draft')
);

-- =====================================================================
-- จบสคริปต์
-- =====================================================================
