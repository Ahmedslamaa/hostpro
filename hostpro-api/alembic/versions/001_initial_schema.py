"""initial schema

Revision ID: 001
Revises:
Create Date: 2025-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # tenants
    op.create_table('tenants',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('slug', sa.String(100), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('plan', sa.String(50), server_default='trial'),
        sa.Column('stripe_customer_id', sa.String(255)),
        sa.Column('settings', postgresql.JSON(), server_default='{}'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('slug'),
    )

    # users
    op.create_table('users',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('email', sa.String(255), nullable=False),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('full_name', sa.String(255)),
        sa.Column('phone', sa.String(50)),
        sa.Column('avatar_url', sa.String(500)),
        sa.Column('is_superadmin', sa.Boolean(), server_default='false'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('last_login_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
    )
    op.create_index('idx_users_email', 'users', ['email'])

    # user_tenant_memberships
    op.create_table('user_tenant_memberships',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(50), nullable=False, server_default='manager'),
        sa.Column('permissions', postgresql.JSON(), server_default='{}'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('invited_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('joined_at', sa.TIMESTAMP(timezone=True)),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # subscriptions
    op.create_table('subscriptions',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('stripe_subscription_id', sa.String(255)),
        sa.Column('stripe_price_id', sa.String(255)),
        sa.Column('plan', sa.String(50), nullable=False),
        sa.Column('status', sa.String(50)),
        sa.Column('current_period_start', sa.TIMESTAMP(timezone=True)),
        sa.Column('current_period_end', sa.TIMESTAMP(timezone=True)),
        sa.Column('trial_end', sa.TIMESTAMP(timezone=True)),
        sa.Column('properties_limit', sa.Integer()),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('tenant_id'),
    )

    # owners
    op.create_table('owners',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True)),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255)),
        sa.Column('phone', sa.String(50)),
        sa.Column('address', sa.Text()),
        sa.Column('notes', sa.Text()),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_owners_tenant', 'owners', ['tenant_id'])

    # properties
    op.create_table('properties',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('owner_id', postgresql.UUID(as_uuid=True)),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('slug', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('property_type', sa.String(50), server_default='apartment'),
        sa.Column('status', sa.String(50), server_default='active'),
        sa.Column('address', sa.String(500)),
        sa.Column('city', sa.String(100)),
        sa.Column('postal_code', sa.String(20)),
        sa.Column('country', sa.String(10), server_default='FR'),
        sa.Column('latitude', sa.Numeric(10, 8)),
        sa.Column('longitude', sa.Numeric(11, 8)),
        sa.Column('max_guests', sa.Integer(), server_default='2'),
        sa.Column('bedrooms', sa.Integer(), server_default='1'),
        sa.Column('bathrooms', sa.Integer(), server_default='1'),
        sa.Column('surface_m2', sa.Numeric(8, 2)),
        sa.Column('min_stay_nights', sa.Integer(), server_default='1'),
        sa.Column('max_stay_nights', sa.Integer()),
        sa.Column('check_in_time', sa.String(10), server_default='16:00'),
        sa.Column('check_out_time', sa.String(10), server_default='11:00'),
        sa.Column('base_price_night', sa.Numeric(10, 2)),
        sa.Column('cleaning_fee', sa.Numeric(10, 2), server_default='0'),
        sa.Column('security_deposit', sa.Numeric(10, 2), server_default='0'),
        sa.Column('amenities', postgresql.JSON(), server_default='[]'),
        sa.Column('house_rules', postgresql.JSON(), server_default='[]'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['owner_id'], ['owners.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_properties_tenant', 'properties', ['tenant_id'])

    # property_photos
    op.create_table('property_photos',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('url', sa.Text(), nullable=False),
        sa.Column('caption', sa.String(255)),
        sa.Column('position', sa.Integer(), server_default='0'),
        sa.Column('is_cover', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.String(50)),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

    # guests
    op.create_table('guests',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('email', sa.String(255)),
        sa.Column('phone', sa.String(50)),
        sa.Column('nationality', sa.String(10)),
        sa.Column('id_document', sa.String(100)),
        sa.Column('notes', sa.Text()),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_guests_tenant', 'guests', ['tenant_id'])

    # reservations
    op.create_table('reservations',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('guest_id', postgresql.UUID(as_uuid=True)),
        sa.Column('source', sa.String(50), server_default='manual'),
        sa.Column('source_ref_id', sa.String(255)),
        sa.Column('check_in', sa.Date(), nullable=False),
        sa.Column('check_out', sa.Date(), nullable=False),
        sa.Column('status', sa.String(50), server_default='confirmed'),
        sa.Column('total_amount', sa.Numeric(10, 2)),
        sa.Column('cleaning_fee', sa.Numeric(10, 2)),
        sa.Column('platform_fee', sa.Numeric(10, 2)),
        sa.Column('net_revenue', sa.Numeric(10, 2)),
        sa.Column('payment_status', sa.String(50), server_default='pending'),
        sa.Column('adults', sa.Integer(), server_default='1'),
        sa.Column('children', sa.Integer(), server_default='0'),
        sa.Column('notes_internal', sa.Text()),
        sa.Column('notes_guest', sa.Text()),
        sa.Column('check_in_done', sa.Boolean(), server_default='false'),
        sa.Column('check_out_done', sa.Boolean(), server_default='false'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id']),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_reservations_tenant', 'reservations', ['tenant_id'])
    op.create_index('idx_reservations_property_dates', 'reservations', ['property_id', 'check_in', 'check_out'])

    # calendar_events
    op.create_table('calendar_events',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('reservation_id', postgresql.UUID(as_uuid=True)),
        sa.Column('event_type', sa.String(50), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('title', sa.String(255)),
        sa.Column('color', sa.String(20)),
        sa.Column('source', sa.String(50), server_default='manual'),
        sa.Column('source_uid', sa.String(500)),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id']),
        sa.ForeignKeyConstraint(['reservation_id'], ['reservations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_calendar_tenant', 'calendar_events', ['tenant_id'])
    op.create_index('idx_calendar_property_dates', 'calendar_events', ['property_id', 'start_date', 'end_date'])

    # ical_feeds
    op.create_table('ical_feeds',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('platform', sa.String(50)),
        sa.Column('feed_url', sa.Text(), nullable=False),
        sa.Column('direction', sa.String(20), server_default='import'),
        sa.Column('last_synced_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('sync_status', sa.String(50), server_default='pending'),
        sa.Column('error_message', sa.Text()),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # tasks
    op.create_table('tasks',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True)),
        sa.Column('reservation_id', postgresql.UUID(as_uuid=True)),
        sa.Column('task_type', sa.String(50), nullable=False, server_default='other'),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('status', sa.String(50), server_default='pending'),
        sa.Column('priority', sa.String(20), server_default='normal'),
        sa.Column('due_date', sa.Date()),
        sa.Column('due_time', sa.String(10)),
        sa.Column('assigned_to', postgresql.UUID(as_uuid=True)),
        sa.Column('completed_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('notes', sa.Text()),
        sa.Column('photos', postgresql.JSON(), server_default='[]'),
        sa.Column('created_by', postgresql.UUID(as_uuid=True)),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id']),
        sa.ForeignKeyConstraint(['reservation_id'], ['reservations.id']),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id']),
        sa.ForeignKeyConstraint(['created_by'], ['users.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_tasks_tenant_status', 'tasks', ['tenant_id', 'status'])

    # message_templates
    op.create_table('message_templates',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('trigger', sa.String(100)),
        sa.Column('subject', sa.String(500)),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('channel', sa.String(50), server_default='email'),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # message_threads
    op.create_table('message_threads',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True)),
        sa.Column('reservation_id', postgresql.UUID(as_uuid=True)),
        sa.Column('guest_id', postgresql.UUID(as_uuid=True)),
        sa.Column('channel', sa.String(50), server_default='email'),
        sa.Column('status', sa.String(50), server_default='open'),
        sa.Column('last_message_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True), server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id']),
        sa.ForeignKeyConstraint(['reservation_id'], ['reservations.id']),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # messages
    op.create_table('messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('thread_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('direction', sa.String(20), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_automated', sa.Boolean(), server_default='false'),
        sa.Column('template_id', postgresql.UUID(as_uuid=True)),
        sa.Column('sent_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('read_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True)),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['thread_id'], ['message_threads.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['template_id'], ['message_templates.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # compliance_records
    op.create_table('compliance_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('registration_number', sa.String(100)),
        sa.Column('registration_city', sa.String(100)),
        sa.Column('registration_expiry', sa.Date()),
        sa.Column('nuitees_year', sa.Integer(), server_default='0'),
        sa.Column('nuitees_limit', sa.Integer(), server_default='120'),
        sa.Column('nuitees_alert_at', sa.Integer(), server_default='100'),
        sa.Column('current_year', sa.Integer()),
        sa.Column('dpe_class', sa.String(5)),
        sa.Column('dpe_expiry', sa.Date()),
        sa.Column('dpe_value', sa.Numeric(8, 2)),
        sa.Column('fiscal_regime', sa.String(50)),
        sa.Column('siret', sa.String(20)),
        sa.Column('tva_number', sa.String(30)),
        sa.Column('is_compliant', sa.Boolean(), server_default='true'),
        sa.Column('alerts', postgresql.JSON(), server_default='[]'),
        sa.Column('last_checked_at', sa.TIMESTAMP(timezone=True)),
        sa.Column('updated_at', sa.TIMESTAMP(timezone=True)),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id']),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id']),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('property_id'),
    )

    # nuitees_history
    op.create_table('nuitees_history',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('compliance_record_id', postgresql.UUID(as_uuid=True)),
        sa.Column('reservation_id', postgresql.UUID(as_uuid=True)),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('nuitees_count', sa.Integer(), nullable=False),
        sa.Column('check_in', sa.Date()),
        sa.Column('check_out', sa.Date()),
        sa.Column('created_at', sa.TIMESTAMP(timezone=True)),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id']),
        sa.ForeignKeyConstraint(['compliance_record_id'], ['compliance_records.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('idx_nuitees_property_year', 'nuitees_history', ['property_id', 'year'])


def downgrade() -> None:
    op.drop_table('nuitees_history')
    op.drop_table('compliance_records')
    op.drop_table('messages')
    op.drop_table('message_threads')
    op.drop_table('message_templates')
    op.drop_table('tasks')
    op.drop_table('ical_feeds')
    op.drop_table('calendar_events')
    op.drop_table('reservations')
    op.drop_table('guests')
    op.drop_table('property_photos')
    op.drop_table('properties')
    op.drop_table('owners')
    op.drop_table('subscriptions')
    op.drop_table('user_tenant_memberships')
    op.drop_table('users')
    op.drop_table('tenants')
