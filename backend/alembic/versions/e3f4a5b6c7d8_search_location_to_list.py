"""search_location (str) -> search_locations (list)

Çoklu şehir desteği: tek string yerine liste tutulur.

Revision ID: e3f4a5b6c7d8
Revises: d2e3f4a5b6c7
Create Date: 2026-06-24 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3f4a5b6c7d8'
down_revision: Union[str, None] = 'd2e3f4a5b6c7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('profiles', 'search_location')
    op.add_column(
        'profiles',
        sa.Column('search_locations', sa.JSON(), nullable=False, server_default=sa.text("'[]'")),
    )


def downgrade() -> None:
    op.drop_column('profiles', 'search_locations')
    op.add_column('profiles', sa.Column('search_location', sa.String(length=255), nullable=True))
