CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE transacciones (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER REFERENCES usuarios(id),
  monto DECIMAL(10, 2) NOT NULL,
  tipo VARCHAR(10) CHECK (tipo IN ('ingreso', 'gasto')),
  categoria VARCHAR(50),
  fecha DATE DEFAULT CURRENT_DATE
);