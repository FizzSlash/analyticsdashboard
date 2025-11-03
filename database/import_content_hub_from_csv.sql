-- IMPORT CONTENT HUB DATA FROM AIRTABLE IN-HOUSE TABLE
-- Run this in Supabase SQL Editor

-- This will populate ops_brand_links with all your Figma, Google Drive, and other links
-- Client names are mapped to UUIDs

BEGIN;

-- TriRig Links
INSERT INTO ops_brand_links (client_id, link_type, link_name, url) VALUES
('07d35bc0-c20b-4c7a-89a7-9ad9e2d0445b', 'Portal', 'Client Portal', 'https://www.retentionharbor.com/tririg/campaign-calender'),
('07d35bc0-c20b-4c7a-89a7-9ad9e2d0445b', 'Figma', 'Figma', 'https://www.figma.com/design/BaIhN8cbJ1105mh3WLC4yw/TRIRIG?node-id=0-1&node-type=canvas&t=XJZzYYLFJJyM1pqi-0'),
('07d35bc0-c20b-4c7a-89a7-9ad9e2d0445b', 'Google Drive', 'Evergreen Image Assets', 'https://drive.google.com/drive/u/1/folders/1M-Nq68cIuaOaAFwf7uEt7f8ZDpNe2tdr'),
('07d35bc0-c20b-4c7a-89a7-9ad9e2d0445b', 'Google Drive', 'BFCM 2024 Assets', 'https://drive.google.com/drive/u/1/folders/16akS1B65K1v27TxbggAyeSr2atvWdbQq'),
('07d35bc0-c20b-4c7a-89a7-9ad9e2d0445b', 'Google Forms', 'Brand Questionnaire', 'https://docs.google.com/forms/d/1F-9epGwQurrDSKvlwZQbL3BPMY5MTS5343yPCbUkPQs/edit#response=ACYDBNgWFpQJM_yMaE-V7_rSfv2NBcxV5yvyiBv5pgo0Am2LVQq4JrH8GZcN-SZkubRKdUE'),
('07d35bc0-c20b-4c7a-89a7-9ad9e2d0445b', 'Google Drive', 'Shared Google Drive', 'https://drive.google.com/drive/folders/0ABSn6sILssk6Uk9PVA');

-- Hydrus Links
INSERT INTO ops_brand_links (client_id, link_type, link_name, url, credentials) VALUES
('b6143ad7-8db1-4c56-b302-b7ef325fb6e6', 'Figma', 'Figma', 'https://www.figma.com/design/pRLonwaLrjSRpH3xYcsC5x/HYDRUS-BOARD-TECH', NULL),
('b6143ad7-8db1-4c56-b302-b7ef325fb6e6', 'Other', 'Hydrus Image Assets', 'https://www.dash.app/', 'email: connor@retentionharbor.com, password: 49highG#');

-- Sizzlefish Links (Note: Client not in database - will skip)
-- INSERT INTO ops_brand_links (client_id, link_type, link_name, url) VALUES
-- ('SIZZLEFISH_UUID', 'Figma', 'Figma', 'https://www.figma.com/design/OrUEk7Eu6J92bxxFWu7U17/SIZZLEFISH?node-id=1-2&node-type=canvas&t=Tq3N3ALdMH7BrAt9-0'),
-- ('SIZZLEFISH_UUID', 'Google Drive', 'Sizzlefish Image Assets', 'https://drive.google.com/drive/folders/1SEfSTJUKsePrUNhVf_WJv7L_EUU-wwAm?dmr=1&ec=wgc-drive-globalnav-goto');

-- Ramrods Archery Links
INSERT INTO ops_brand_links (client_id, link_type, link_name, url, credentials) VALUES
('d2303a63-94ca-494e-a807-666ff9a5fec6', 'Portal', 'Client Portal', 'https://www.retentionharbor.com/ramrods-archery/campaign-calender', NULL),
('d2303a63-94ca-494e-a807-666ff9a5fec6', 'Google Drive', 'Ramrods Style Guide', 'https://drive.google.com/file/d/10YQtVao9XGj-Fwr5VpsqRNoeYGJ-6c1w/view?usp=sharing', NULL),
('d2303a63-94ca-494e-a807-666ff9a5fec6', 'Figma', 'Figma', 'https://www.figma.com/design/2viMcO3v1Cc9WEj6dBEabG/RAMRODS-ARCHERY?node-id=0-1&t=VLpe6YY0pzbvkAdS-1', NULL),
('d2303a63-94ca-494e-a807-666ff9a5fec6', 'Dropbox', 'Ramrods Image Assets', 'https://www.dropbox.com/', 'email: connor@retentionharbor.com, password: RetentionHarbor1$'),
('d2303a63-94ca-494e-a807-666ff9a5fec6', 'Google Forms', 'Brand Questionnaire', 'https://docs.google.com/forms/d/1F-9epGwQurrDSKvlwZQbL3BPMY5MTS5343yPCbUkPQs/edit#response=ACYDBNiKI5MH3Un_eah6u1R3g6CapW2L1QaXMIBKxa015Urbov3mJCH0QS2mCGM93gWJWAk', NULL);

-- Lay It Flat Links (Note: Client not in database - will skip)
-- INSERT INTO ops_brand_links (client_id, link_type, link_name, url) VALUES
-- ('LAY_IT_FLAT_UUID', 'Figma', 'Figma', 'https://www.figma.com/design/x2GEWNiZ0GUdcgcEXKOzm9/Lay-it-Flat?node-id=0-1&t=OYnw3OMOnqR32X3P-1'),
-- ('LAY_IT_FLAT_UUID', 'Google Drive', 'Assets', 'https://drive.google.com/drive/folders/18HV9VUu3rlkiZeK9Ue3lGnryJO3vfeuV');

-- Safari Pedals Links
INSERT INTO ops_brand_links (client_id, link_type, link_name, url) VALUES
('5f8f83a2-6a13-4ada-afcb-1b708832d6a6', 'Portal', 'Client Portal', 'https://www.retentionharbor.com/safari-pedals/campaign-calender'),
('5f8f83a2-6a13-4ada-afcb-1b708832d6a6', 'Google Forms', 'Brand Questionnaire', 'https://docs.google.com/forms/d/1F-9epGwQurrDSKvlwZQbL3BPMY5MTS5343yPCbUkPQs/edit#response=ACYDBNh_CuUCs9jNyxG1eM5zQvBhPMnLGYxlMHfyVPid5Egp2TGftX8KzDG00W7PXGpk1bk'),
('5f8f83a2-6a13-4ada-afcb-1b708832d6a6', 'Google Drive', 'Assets', 'https://drive.google.com/drive/folders/1H8Jt5ljMEzKB8w1n-RnfMjRX8ols1dVe?usp=sharing'),
('5f8f83a2-6a13-4ada-afcb-1b708832d6a6', 'Figma', 'Figma', 'https://www.figma.com/design/2cLOpdtCE2RRhhgMutXnmZ/SAFARI-PEDALS?node-id=1-12&t=r87jm4k9bOQuLgBS-1');

-- Backyard Escapism Links (Note: Client not in database - will skip)
-- INSERT INTO ops_brand_links (client_id, link_type, link_name, url) VALUES
-- ('BACKYARD_UUID', 'Figma', 'Figma', 'https://www.figma.com/design/ezv0vgq6J19hks2UoJRsco/BACKYARD-ESCAPISM?node-id=3-12&p=f&t=Wb2i2uxRpOoeKcIc-0'),
-- ('BACKYARD_UUID', 'Portal', 'Client Portal', 'https://www.retentionharbor.com/backyard-escapism/content-calender'),
-- ('BACKYARD_UUID', 'Google Forms', 'Brand Questionnaire', 'https://docs.google.com/forms/d/1F-9epGwQurrDSKvlwZQbL3BPMY5MTS5343yPCbUkPQs/edit#response=ACYDBNjD5Bm6nrzOryiHxYSWJmVEzr8XwA7Ljg1BlYVbOxfPkkJf-uZhFG-cRakdVYl1tYM');

-- Nyan Links
INSERT INTO ops_brand_links (client_id, link_type, link_name, url) VALUES
('b414946b-9c6a-4d8a-978a-1da810a1d644', 'Google Drive', 'Assets', 'https://drive.google.com/drive/folders/1v1CihaH2zt6fB7i3EX1UyzGUAMnm3Xzj'),
('b414946b-9c6a-4d8a-978a-1da810a1d644', 'Figma', 'Figma', 'https://www.figma.com/design/4GlwBXCRPVrao5WED9yulV/NYAN?node-id=0-1&t=H3YTKsvDgFkCie2X-1'),
('b414946b-9c6a-4d8a-978a-1da810a1d644', 'Portal', 'Client Portal', 'https://www.retentionharbor.com/nyan/content-calender');

-- Montis Links
INSERT INTO ops_brand_links (client_id, link_type, link_name, url) VALUES
('45d498e4-a44d-47e5-a24f-833624d69e16', 'Figma', 'Figma', 'https://www.figma.com/design/03ftEkweQxeW34Xp8RJsML/MONTIS-PICKLEBALL?node-id=0-1&t=qnp8CVfXhmVN8O0U-1'),
('45d498e4-a44d-47e5-a24f-833624d69e16', 'Portal', 'Client Portal', 'https://www.retentionharbor.com/montis/content-calender'),
('45d498e4-a44d-47e5-a24f-833624d69e16', 'Google Drive', 'Montis Alive Media', 'https://drive.google.com/drive/folders/1_l66Bna1II-Io8ZkvVzNlFoC_ctkHVJ0?usp=sharing'),
('45d498e4-a44d-47e5-a24f-833624d69e16', 'Google Drive', 'Assets', 'https://drive.google.com/drive/folders/172P_FAdhslFWwO1MqV5aStqPB6iEGYl0?usp=sharing'),
('45d498e4-a44d-47e5-a24f-833624d69e16', 'Google Drive', 'Montis Pickleball Content', 'https://drive.google.com/drive/folders/1GnFNUTE3xS6zyKtfmFlNhbKu-TsxeX49?usp=sharing');

-- Rythm Health Links (Note: Client not in database - will skip)
-- INSERT INTO ops_brand_links (client_id, link_type, link_name, url) VALUES
-- ('RYTHM_UUID', 'Google Drive', 'Assets', 'https://drive.google.com/drive/folders/1bbLyDS4MwnnIl2tWsQ9u5-btIP70qOo4?usp=drive_link'),
-- ('RYTHM_UUID', 'Figma', 'Figma', 'https://www.figma.com/design/PzecuTDbIES42Jczoz5iUs/RYTHM-HEALTH?node-id=0-1&t=DJEnokXb5rnZkI7h-1');

-- Brilliant Scents Links
INSERT INTO ops_brand_links (client_id, link_type, link_name, url) VALUES
('72df2b41-f314-47f4-a2ab-737d7fd1b391', 'Google Sheets', 'Every Pic You Could Ever Want', 'https://docs.google.com/spreadsheets/d/1H9w3x85QNRTIADFIxgA5lYMIxiLSZ4IcQWTs-94UKRM/edit?gid=0#gid=0'),
('72df2b41-f314-47f4-a2ab-737d7fd1b391', 'Canva', 'Email Examples', 'https://www.canva.com/design/DAGIBpL4rJ8/TuEWaqB6-JXNRXTV2UPr7w/view?utm_content=DAGIBpL4rJ8&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h9b91d91b96'),
('72df2b41-f314-47f4-a2ab-737d7fd1b391', 'Google Sheets', 'Promo Cal', 'https://docs.google.com/spreadsheets/d/10TfpLg6T1qb1MRan5dvvxZpcBIPkO8z-PQiOzQ_qL5A/edit?gid=458013738#gid=458013738'),
('72df2b41-f314-47f4-a2ab-737d7fd1b391', 'Google Sheets', 'Email Cal', 'https://docs.google.com/spreadsheets/d/1EcRIA8whwpOEVxQW2hbqARGWyjnRl11-RR_KQbzkZk0/edit?gid=1746011117#gid=1746011117');

COMMIT;

-- Verify import
SELECT 
  c.brand_name,
  bl.link_type,
  bl.link_name,
  bl.url
FROM ops_brand_links bl
JOIN clients c ON c.id = bl.client_id
ORDER BY c.brand_name, bl.link_type;

SELECT '✅ Content Hub links imported!' as status;
SELECT COUNT(*) as total_links FROM ops_brand_links;
SELECT COUNT(DISTINCT client_id) as clients_with_links FROM ops_brand_links;

