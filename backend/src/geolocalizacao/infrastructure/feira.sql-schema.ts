/**
 * Esquema do banco de geolocalização (Azure SQL). Cada comando é idempotente, então pode rodar a cada subida.
 * id_ong e id_animal são referências lógicas (REF) a outros serviços: não há FK física entre bancos.
 */
export const DDL_FEIRAS: string[] = [
  `IF OBJECT_ID('dbo.feiras', 'U') IS NULL
   CREATE TABLE dbo.feiras (
     id           UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_feiras PRIMARY KEY,
     nome         NVARCHAR(100)    NOT NULL,
     descricao    NVARCHAR(500)    NULL,
     endereco     NVARCHAR(200)    NOT NULL,
     latitude     FLOAT            NOT NULL,
     longitude    FLOAT            NOT NULL,
     data_inicio  DATETIME2(3)     NOT NULL,
     data_fim     DATETIME2(3)     NOT NULL,
     id_ong       VARCHAR(64)      NOT NULL,  -- REF: serviço de usuários
     criada_em    DATETIME2(3)     NOT NULL CONSTRAINT DF_feiras_criada_em DEFAULT SYSUTCDATETIME()
   )`,
  `IF OBJECT_ID('dbo.feira_animais', 'U') IS NULL
   CREATE TABLE dbo.feira_animais (
     id_feira   UNIQUEIDENTIFIER NOT NULL,
     id_animal  VARCHAR(64)      NOT NULL,    -- REF: serviço de adoção
     CONSTRAINT PK_feira_animais PRIMARY KEY (id_feira, id_animal),
     CONSTRAINT FK_feira_animais_feira FOREIGN KEY (id_feira) REFERENCES dbo.feiras (id) ON DELETE CASCADE
   )`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_feiras_fim_lat_lng' AND object_id = OBJECT_ID('dbo.feiras'))
   CREATE INDEX IX_feiras_fim_lat_lng ON dbo.feiras (data_fim, latitude, longitude)`,
  `IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_feiras_id_ong' AND object_id = OBJECT_ID('dbo.feiras'))
   CREATE INDEX IX_feiras_id_ong ON dbo.feiras (id_ong)`,
];
