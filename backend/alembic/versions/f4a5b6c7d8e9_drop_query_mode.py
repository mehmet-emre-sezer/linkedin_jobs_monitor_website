"""drop query_mode from profiles

Sorgular yalnızca tercihlerden deterministik kuruluyor; query_mode (manual/ai/hybrid)
gereksizleşti. AI artık sorgu üretmiyor, sadece optimize ediyor.

Revision ID: f4a5b6c7d8e9
Revises: e3f4a5b6c7d8
Create Date: 2026-06-27 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f4a5b6c7d8e9'
down_revision: Union[str, None] = 'e3f4a5b6c7d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('profiles', 'query_mode')


def downgrade() -> None:
    op.add_column(
        'profiles',
        sa.Column('query_mode', sa.String(length=16), nullable=False, server_default='ai'),
    )
