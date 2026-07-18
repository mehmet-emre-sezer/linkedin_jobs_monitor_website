"""add telegram_link_token to profiles

Telegram'ın /start parametresi en fazla 64 karakter ve sadece [A-Za-z0-9_-]
kabul ettiği için JWT deep link'te kullanılamıyor. Kısa opak token profile
üzerinde saklanıyor.

Revision ID: a5b6c7d8e9fa
Revises: f4a5b6c7d8e9
Create Date: 2026-07-19 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a5b6c7d8e9fa'
down_revision: Union[str, None] = 'f4a5b6c7d8e9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'profiles',
        sa.Column('telegram_link_token', sa.String(length=64), nullable=True),
    )
    op.add_column(
        'profiles',
        sa.Column(
            'telegram_link_expires_at',
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    op.create_index(
        'ix_profiles_telegram_link_token',
        'profiles',
        ['telegram_link_token'],
        unique=True,
    )


def downgrade() -> None:
    op.drop_index('ix_profiles_telegram_link_token', table_name='profiles')
    op.drop_column('profiles', 'telegram_link_expires_at')
    op.drop_column('profiles', 'telegram_link_token')
