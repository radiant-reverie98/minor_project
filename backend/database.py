from dotenv import load_dotenv
import os
from urllib.parse import quote_plus

from sqlalchemy import create_engine,text
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

# TiDB Cloud connection settings
DB_USER = os.getenv("MYSQL_USER")
DB_PASSWORD = os.getenv("MYSQL_PASSWORD")
DB_HOST = "gateway01.ap-northeast-1.prod.aws.tidbcloud.com"
DB_PORT = 4000
DB_NAME = "facultyconnect"

if not DB_USER or not DB_PASSWORD:
    raise RuntimeError(
        "MYSQL_USER or MYSQL_PASSWORD is not set in your .env file."
    )

DATABASE_URL = (
    f"mysql+pymysql://{quote_plus(DB_USER)}:{quote_plus(DB_PASSWORD)}"
    f"@{DB_HOST}:{DB_PORT}/{DB_NAME}?ssl_verify_cert=true"
    f"&ssl_verify_identity=true"
    f"&ssl_ca=C%3A%5CUsers%5CDell%5CDocuments%5Cca.pem"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
)
try:
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
        print("✅ Database connected successfully!")
except Exception as e:
    print(f"❌ Database connection failed: {e}")
    raise

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()