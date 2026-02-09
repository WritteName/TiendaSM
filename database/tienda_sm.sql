IF DB_ID(N'TiendaSM') IS NULL
BEGIN
  CREATE DATABASE TiendaSM;
END
GO

USE TiendaSM;
GO

IF OBJECT_ID('dbo.Grupo','U') IS NOT NULL DROP TABLE dbo.Grupo;
GO
CREATE TABLE dbo.Grupo (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(100) NOT NULL,
    descripcion NVARCHAR(255) NULL,
);
GO

INSERT INTO Grupo (nombre, descripcion) VALUES
('Frutas', 'Productos frutales'), ('Hortalizas', 'Productos de huerta'), ('Verduras', 'Vegetales y verduras');
GO

IF OBJECT_ID('dbo.Producto','U') IS NOT NULL DROP TABLE dbo.Producto;
GO
CREATE TABLE dbo.Producto (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(100) NOT NULL,
    grupoID INT NOT NULL,
    PrecioUnitario DECIMAL(10, 2) NOT NULL,
    Kilos INT NOT NULL,

    CONSTRAINT FK_Producto_Grupo FOREIGN KEY (grupoID) REFERENCES dbo.Grupo(id),
    CONSTRAINT CHK_NombreProducto CHECK (LEN(TRIM(nombre)) > 0),
    CONSTRAINT CHK_PrecioUnitario CHECK (PrecioUnitario >= 0)
);
GO

INSERT INTO Producto (nombre, grupoID, PrecioUnitario, Kilos) VALUES
('Naranjas', 1, 1.00, 6000), ('Malocoton', 1, 2.00, 5000), ('Esparragos', 2, 3.50, 4000), ('Tomates', 3, 1.50, 5000), ('Melones', 1, 2.50, 4000);
GO

IF OBJECT_ID('dbo.Vendedor','U') IS NOT NULL DROP TABLE dbo.Vendedor;
GO
CREATE TABLE dbo.Vendedor (
    id INT PRIMARY KEY IDENTITY(1,1),
    nombre NVARCHAR(100) NOT NULL,
    apellido NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NULL,

    CONSTRAINT CHK_NombreVendedor CHECK (LEN(TRIM(nombre)) > 0),
    CONSTRAINT UQ_Email UNIQUE (email)
);
GO

INSERT INTO Vendedor (nombre, apellido, email) VALUES
('Pepito', 'García', 'pepito.garcia@distribuidora.com'), ('Antonio', 'Martínez', 'antonio.martinez@distribuidora.com');
GO

IF OBJECT_ID('dbo.Venta','U') IS NOT NULL DROP TABLE dbo.Venta;
GO
CREATE TABLE dbo.Venta (
    id INT PRIMARY KEY IDENTITY(1,1),
    fecha_venta DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    producto INT NOT NULL,
    precio_venta DECIMAL(10, 2) NOT NULL,
    kilos DECIMAL(10, 2) NOT NULL,
    MontoTotal AS (kilos*precio_venta) PERSISTED,
    vendedor INT NOT NULL


    CONSTRAINT FK_Venta_Producto FOREIGN KEY (producto) REFERENCES dbo.Producto(id),
    CONSTRAINT FK_Venta_Vendedor FOREIGN KEY (vendedor) REFERENCES dbo.Vendedor(id),
    CONSTRAINT CHK_Kilos CHECK (Kilos > 0),
    CONSTRAINT CHK_Precio CHECK (precio_venta >= 0)
);
GO

INSERT INTO Venta (fecha_venta, producto, precio_venta, kilos, vendedor) VALUES
('2004-03-15', 1, 1.00, 2319, 1),
('2004-03-15', 1, 1.00, 2143, 1),
('2004-03-15', 2, 2.00, 1999, 1);
GO