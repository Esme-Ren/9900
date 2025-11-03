# table
import django_tables2 as tables
from django_tables2 import Column, Table, LinkColumn
from .models import ActionDb
from django_tables2.utils import A  # alias for Accessor


class ActionsTable(Table):
    # accessor must equal to SdgActions variable name
    # variable name here has to match the accessor name

    id = Column(accessor='id', verbose_name='ID', visible=False)
    actions = Column(accessor='actions', verbose_name='Actions')
    field_sdgs = Column(accessor='field_sdgs', verbose_name='Related SDGs')
    level = LinkColumn("level_detail", args=[A("level")], verbose_name='Level')
    action_detail_0 = Column(accessor='action_detail',
                             verbose_name='Action detail')
    related_industry_org = Column(
        accessor='related_industry_org', verbose_name='Industry')
    individual_organization = Column(
        accessor='individual_organization', verbose_name='Indv.|Org.', visible=False)
    award = Column(accessor='award', verbose_name='award', visible=False)

    digital_actions = Column(
        accessor='digital', verbose_name='Digital', visible=False)
    sources = Column(accessor='sources', verbose_name='Sources', visible=False)
    links = Column(accessor='links', verbose_name='Links', visible=False)
    additional_notes = Column(
        accessor='additional_notes', verbose_name='Notes', visible=False)

    detail = tables.TemplateColumn(
        '<a href="/sdg_ActionDB/detail/{{record.id}}">Detail</a>')

    class Meta:
        model = ActionDb
        attrs = {"class": "table thead-light table-striped table-hover"}
        sequence = ('id', 'actions', 'field_sdgs', 'level',
                    'action_detail_0', 'related_industry_org', 'links')
        template_name = "django_tables2/bootstrap4.html"
