"""add search preferences to profiles

Revision ID: d2e3f4a5b6c7
Revises: c4d9a1b2e3f4
Create Date: 2026-06-24 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd2e3f4a5b6c7'
down_revision: Union[str, None] = 'c4d9a1b2e3f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('profiles', sa.Column('search_location', sa.String(length=255), nullable=True))
    op.add_column('profiles', sa.Column('work_mode', sa.String(length=16), nullable=False, server_default='any'))
    op.add_column('profiles', sa.Column('target_roles', sa.JSON(), nullable=False, server_default=sa.text("'[]'")))
    op.add_column('profiles', sa.Column('target_levels', sa.JSON(), nullable=False, server_default=sa.text("'[]'")))
    op.add_column('profiles', sa.Column('query_mode', sa.String(length=16), nullable=False, server_default='ai'))


def downgrade() -> None:
    op.drop_column('profiles', 'query_mode')
    op.drop_column('profiles', 'target_levels')
    op.drop_column('profiles', 'target_roles')
    op.drop_column('profiles', 'work_mode')
    op.drop_column('profiles', 'search_location')
