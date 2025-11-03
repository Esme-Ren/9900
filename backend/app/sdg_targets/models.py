from django.db import models
from django.urls import reverse
from django.utils.html import mark_safe

# iterable
SDGTarget_CHOICES =(
    ("1", "SDG1 No Poverty"),
    ("2", "SDG 2 Zero Hunger"),
    ("3", "SDG 3 Good Health and Well-being"),
    ("4", "SDG 4 Quality Education"),
    ("5", "SDG 5 Gender Equality"),
    ("6", "SDG 6 Clean Water and Sanitation"),
    ("7", "SDG 7 Affordable and Clean Energy"),
    ("8", "SDG 8 Decent Work and Economic Growth"),
    ("9", "SDG 9 Industry, Innovation and Infrastructure"),
    ("10", "SDG 10 Reduced Inequalities"),
    ("11", "SDG 11 Sustainable Cities and Communities"),
    ("12", "SDG 12 Responsible Consumption and Production"),
    ("13", "SDG 13 Climate Action"),
    ("14", "SDG 14 Life Below Water"),
    ("15", "SDG 15 Life on Land"),
    ("16", "SDG 16 Justice, Peace and Strong Institutions"),
    ("17", "SDG 17 Partnership for the Goals")
)

SDG_Small_Target = {
      ("1.1", "1.1 Eradicate extreme poverty"),
    ("1.2", "1.2 Reduce poverty by at least 50%"),
    ("1.3", "1.3 Implement social protection systems"),
    ("1.4", "1.4 Equal rights to ownership, basic services, technology and economic resources"),
    ('1.5', '1.5 Build resilience to environmental, economic and social disasters'),
    ('1.A', '1.A Mobilisation of resources to end poverty'),
    ('1.B', "1.B Create Pro-poor and Gender-sensitive policy framewords"),
          ("2.1", "2.1 Universal access to safe and nutritious food"),
    ("2.2", "2.2 End all forms of malnutrition"),
    ("2.3", "2.3 Double the productivity and incomes of small-scale food producers"),
    ("2.4", "2.4 Sustainable food production and resilient agricultural practices"),
    ('2.5', '2.5 Maintain the genetic diversity in food production'),
    ('2.A', '2.A Invest in rural infrastructure, agricultural research, technology and gene banks'),
    ("2.B", "2.B Prevent agricultural trade restrictions, market distortions and export subsidies"),
     ('2.C', "2.C Ensure stable food commodity markets and timely access to information"),
    ("3.1", "3.1 Reduce maternal mortality"),
    ("3.2", "3.2 End all preventable deaths under 5 years of age"),
    ("3.3", "3.3 Fight communicable diseases"),
    ("3.4", "3.4 Reduce mortality from non-communicable diseases and promote mental health"),
    ('3.5', '3.5 Prevent and treat substance abuse'),
    ('3.6', '3.6 Reduce road injuries and deaths'),
    ('3.7', '3.7 Universal access to sexual and reproductive care, family planning and education'),
    ('3.8', '3.8 Achieve universal health coverage'),
    ('3.9', '3.9 Reduce illnesses and deaths from hazardous chemicals and pollution'),
    ('3.A', '3.A Implement the WHO framework convention on tobacco control'),
    ('3.B', "3.B Support research, development and universal access to affordable vaccines and medicines"),
     ('3.C', "3.C Increase health financing and support health workforce in developing countries"),
     ('3.D', "3.D Improve early warning systems for global health risks"),
    ("4.1", "4.1 Free primary and secondary education"),
    ("4.2", "4.2 Equal access to quality pre-primary education"),
    ("4.3", "4.3 Equal access to affordable technical, vocational and higher education"),
    ("4.4", "4.4 Increase the number of people with relevant skills for financial success"),
    ('4.5', '4.5 Eliminate all discrimination in education'),
    ('4.6', '4.6 Universal literacy and numeracy'),
    ('4.7', '4.7 Education for sustainable development and global citizenship'),         
    ('4.A', '4.A Build and upgrade inclusive and safe schools'),
    ('4.B', "4.B Expand higher education scholarships for developing countries"),
    ('4.C', "4.C Increase the supply of qualified teachers in developing countries"),
    ("5.1", "5.1 End discrimination against women and girls"),
    ("5.2", "5.2 End all violence against and exploitation of women and girls"),
    ("5.3", "5.3 Eliminate forced marriages and genital mutilation"),
    ("5.4", "5.4 Value unpaid care and promote shared domestic responsibilities"),
    ('5.5', '5.5 Ensure full participation in leadership and decision-making'),
    ('5.6', '5.6 Universal access to reproductive health and rights'),
    ('5.7', '5.7 Universal access to sexual and reproductive care, family planning and education'),         
    ('5.A', '5.A Equal rights to economic resources, property ownership and financial services'),
    ('5.B', "5.B Promote empowerment of women through technology"),
     ('5.C', "5.C Adopt and strengthen policies and enforceable legislation for gender equality")

}

SDG1_Small_Target = (
  ("1.1", "1.1 Eradicate extreme poverty"),
    ("1.2", "1.2 Reduce poverty by at least 50%"),
    ("1.3", "1.3 Implement social protection systems"),
    ("1.4", "1.4 Equal rights to ownership, basic services, technology and economic resources"),
    ('1.5', '1.5 Build resilience to environmental, economic and social disasters'),
    ('1.A', '1.A Mobilisation of resources to end poverty'),
    ('1.B', "1.B Create Pro-poor and Gender-sensitive policy framewords")
)

SDG2_Small_Target = (
      ("2.1", "2.1 Universal access to safe and nutritious food"),
    ("2.2", "2.2 End all forms of malnutrition"),
    ("2.3", "2.3 Double the productivity and incomes of small-scale food producers"),
    ("2.4", "2.4 Sustainable food production and resilient agricultural practices"),
    ('2.5', '2.5 Maintain the genetic diversity in food production'),
    ('2.A', '2.A Invest in rural infrastructure, agricultural research, technology and gene banks'),
    ("2.B", "2.B Prevent agricultural trade restrictions, market distortions and export subsidies"),
     ('2.C', "2.C Ensure stable food commodity markets and timely access to information")
)

SDG3_Small_Target = (
          ("3.1", "3.1 Reduce maternal mortality"),
    ("3.2", "3.2 End all preventable deaths under 5 years of age"),
    ("3.3", "3.3 Fight communicable diseases"),
    ("3.4", "3.4 Reduce mortality from non-communicable diseases and promote mental health"),
    ('3.5', '3.5 Prevent and treat substance abuse'),
    ('3.6', '3.6 Reduce road injuries and deaths'),
    ('3.7', '3.7 Universal access to sexual and reproductive care, family planning and education'),
    ('3.8', '3.8 Achieve universal health coverage'),
    ('3.9', '3.9 Reduce illnesses and deaths from hazardous chemicals and pollution'),
    ('3.A', '3.A Implement the WHO framework convention on tobacco control'),
    ('3.B', "3.B Support research, development and universal access to affordable vaccines and medicines"),
     ('3.C', "3.C Increase health financing and support health workforce in developing countries"),
     ('3.D', "3.D Improve early warning systems for global health risks")
)

SDG4_Small_Target = (
    ("4.1", "4.1 Free primary and secondary education"),
    ("4.2", "4.2 Equal access to quality pre-primary education"),
    ("4.3", "4.3 Equal access to affordable technical, vocational and higher education"),
    ("4.4", "4.4 Increase the number of people with relevant skills for financial success"),
    ('4.5', '4.5 Eliminate all discrimination in education'),
    ('4.6', '4.6 Universal literacy and numeracy'),
    ('4.7', '4.7 Education for sustainable development and global citizenship'),         
    ('4.A', '4.A Build and upgrade inclusive and safe schools'),
    ('4.B', "4.B Expand higher education scholarships for developing countries"),
    ('4.C', "4.C Increase the supply of qualified teachers in developing countries")
)

SDG5_Small_Target = (
          ("5.1", "5.1 End discrimination against women and girls"),
    ("5.2", "5.2 End all violence against and exploitation of women and girls"),
    ("5.3", "5.3 Eliminate forced marriages and genital mutilation"),
    ("5.4", "5.4 Value unpaid care and promote shared domestic responsibilities"),
    ('5.5', '5.5 Ensure full participation in leadership and decision-making'),
    ('5.6', '5.6 Universal access to reproductive health and rights'),
    ('5.7', '5.7 Universal access to sexual and reproductive care, family planning and education'),         
    ('5.A', '5.A Equal rights to economic resources, property ownership and financial services'),
    ('5.B', "5.B Promote empowerment of women through technology"),
     ('5.C', "5.C Adopt and strengthen policies and enforceable legislation for gender equality")
)

SDG6_Small_Target = (
          ("6.1", "6.1 Safe and affordable drinking water"),
    ("6.2", "6.2 End open defecation and provide access to sanitation and hygiene"),
    ("6.3", "6.3 Improve water quality, wastewater treatment and safe reuse"),
    ("6.4", "6.4 Increase water use efficiency and ensure freshwater supplies"),
    ('6.5', '6.5 Implement integrated water resources management'),
    ('6.6', '6.6 Protect and restore water-related ecosystems'),
    ('6.A', '6.A Expand water and sanitation support to developing countries'),         
    ('6.B', '6.B Support local engagement in water and sanitation management'),
)

SDG7_Small_Target = (
          ("7.1", "7.1 Universal access to modern energy"),
    ("7.2", "7.2 Increase global percentage of renewable energy"),
    ("7.3", "7.3 Double the improvement in energy efficiency"),
    ("7.A", "7.A Promote access, technology and investments in clean energy"),
    ('7.B', '7.B Expand and upgrade energy services for developing countries'),
)


SDG8_Small_Target = (
          ("8.1", "8.1 Sustainable economic growth"),
    ("8.2", "8.2 Diversify, innovate and upgrade for economic productivity"),
    ("8.3", "8.3 Promote policies to support job creation and growing enterprises"),
    ("8.4", "8.4 Improve resource efficiency in consumption and production"),
    ('8.5', '8.5 Full employment and decent work with equal pay'),
    ('8.6', '8.6 Promote youth employment, education and training'),
    ('8.7', '8.7 End modern slavery, trafficking, and child labour'),
    ('8.8', '8.8 Protect labour rights and promote safe working environments'),
    ('8.9', '8.9 Promote beneficial and sustainable tourism'),
    ('8.10', '8.10 Universal access to banking, insurance and financial services'),
    ('8.a', '8.a Increase aid for trade support'),
    ('8.b', '8.b Develop a global youth employment strategy')
)


SDG9_Small_Target = (
          ("9.1", "9.1 Develop sustainable, resilient and inclusive infrastructures"),
    ("9.2", "9.2 Promote inclusive and sustainable industrialization"),
    ("9.3", "9.3 Increase access to financial services and markets"),
    ("9.4", "9.4 Upgrade all industries and infrastructures for sustainability"),
    ('9.5', '9.5 Enhance research and upgrade industrial technologies'),
    ('9.A', '9.A Facilitate sustainable infrastructure development for developing countries'),
    ('9.B', '9.B Support domestic technology development and industrial diversification'),
    ('9.C', '9.C Universal access to information and communications technology'),
)

SDG10_Small_Target = (
          ("10.1", "10.1 Reduce income inequalities"),
    ("10.2", "10.2 Promote universal social, economic and political inclusion"),
    ("10.3", "10.3 Ensure equal opportunities and end discrimination"),
    ("10.4", "10.4 Adopt fiscal and social policies that promotes equality"),
    ('10.5', '10.5 Improved regulation of global financial markets and institutions'),
    ('10.6', '10.6 Enhanced representation for developing countries in financial institutions'),
    ('10.A', '10.A Special and differential treatment for developing countries'),
    ('10.B', '10.B Encourage development assistance and investment in least developed countries'),
    ('10.C', '10.C Reduce transaction costs for migrant remittances'),
)

SDG11_Small_Target = (
          ("11.1", "11.1 Safe and affordable housing"),
    ("11.2", "11.2 Affordable and sustainable transport systems"),
    ("11.3", "11.3 Inclusive and sustainable urbanization"),
    ("11.4", "11.4 Protect the world's cultural and natural heritage"),
    ('11.5', '11.5 Reduce the adverse effects of natural disasters'),
        ('11.6', '11.6 Reduce the environmental impacts of cities'),
        ('11.7', '11.7 Provide access to safe and inclusive green and public spaces'),
    ('11.A', '11.A Strong national and regional development planning'),
    ('11.B', '11.B Implement policies for inclusion, resource efficiency and disaster risk reduction'),
    ('11.C', '11.C Support least developed countries in sustainable and resilient building'),
)

SDG12_Small_Target = (
          ("12.1", "12.1 Implement the 10-year sustainable consumption and production framework"),
    ("12.2", "12.2 Sustainable management and use of natural resources"),
    ("12.3", "12.3 Halve global per capita food waste"),
    ("12.4", "12.4 Responsible management of chemicals and waste"),
    ('12.5', '12.5 Substantially reduce waste generation'),
        ('12.6', '12.6 Encourage companies to adopt sustainable practices and sustainability reporting'),
        ('12.7', '12.7 Promote sustainable public procurement practices'),
    ('12.8', '12.8 Promote universal understanding of sustainable lifestyles'),
    ('12.A', "12.A Support developing countries' scientific and technological capacity for sustainable consumption and production"),
    ('12.B', '12.B Develop and implement tools to monitor sustainable tourism'),
    ('12.C', '12.C Remove market distortions that encourage wasteful consumption'),
)


SDG13_Small_Target = (
          ("13.1", "13.1 Strengthen resilience and adaptive capacity to climate-related disasters"),
    ("13.2", "13.2 Integrate climate change measures into policy and planning"),
    ("13.3", "13.3 Build knowledge and capacity to meet climate change"),
    ("13.A", "13.A Implement the UN Framework Convention on Climate Change"),
    ("13.B", "13.B Promote mechanisms to raise capacity for planning and management"),

)


SDG14_Small_Target = (
          ("14.1", "14.1 Reduce marine pollution"),
    ("14.2", "14.2 Protect and restore ecosystems"),
    ("14.3", "14.3 Reduce ocean acidification"),
    ("14.4", "14.4 Sustainable fishing"),
          ("14.5", "14.5 Conserve coastal and marine areas"),
             ("14.6", "14.6 End subsidies contributing to overfishing"),
                ("14.7", "14.7 Increase the economic benefits from sustainable use of marine resource"),
    ("14.A", "14.A Increase scientific knowledge, research and technology for ocean health"),
        ("14.B", "14.B Support small scale fishers"),
        ('14.C', "Implement and enforce international sea law")
)



SDG15_Small_Target = (
          ("15.1", "15.1 Conserve and restore terrestrial and freshwater ecosystems"),
    ("15.2", "15.2 End deforestation and restore degraded forests"),
    ("15.3", "15.3 End desertification and restore degraded land"),
    ("15.4", "15.4 Ensure conservation of mountain ecosystems"),
          ("15.5", "15.5 Protect biodiversity and natural habitats"),
    ("15.6", "15.6 Protect access to genetic resources and fair sharing of the benefits"),
    ("15.7", "15.7 Eliminate poaching and trafficking of protected species"),
    ("15.8", "15.8 Prevent invasive alien species on land and in water ecosystems"),
          ("15.9", "15.9 Integrate ecosystem and biodiversity in governmental planning"),
    ("15.A", "15.A Increase financial resources to conserve and sustainably use ecosystem and biodiversity"),
    ("15.B", "15.B Finance and incentivize sustainable forest management"),
    ("15.C", "15.C Combat global poaching and trafficking")

)


SDG16_Small_Target = (
          ("16.1", "16.1 Reduce violence everywhere"),
    ("16.2", "16.2 Protect children from abuse, exploitation, trafficking and violence"),
    ("16.3", "16.3 Promote the rule of law and ensure equal access to justice"),
    ("16.4", "16.4 Combat organized crime and illicit financial and arms flows"),
          ("16.5", "16.5 Substantially reduce corruption and bribery"),
    ("16.6", "16.6 Develop effective, accountable and transparent institutions"),
    ("16.7", "16.7 Ensure responsive, inclusive and representative decision-making"),
    ("16.8", "16.8 Strengthen the participation in global governance"),
          ("16.9", "16.9 Provide universal legal identity"),
               ("16.10", "16.10 Ensure public access to information and protect fundamental freedoms"),   
    ("16.A", "16.A Strengthen national institutions to prevent violence and combat crime and terrorism"),
    ("16.B", "16.B Promote and enforce non-discriminatory laws and policies")
)


SDG17_Small_Target = (
          ("17.1", "17.1 Mobilize resources to improve domestic revenue collection"),
    ("17.2", "17.2 Implement all development assistance commitments"),
    ("17.3", "17.3 Mobilize financial resources for developing countries"),
    ("17.4", "17.4 Assist developing countries in attaining debt sustainability"),
          ("17.5", "17.5 Invest in least-developed countries"),
    ("17.6", "17.6 Knowledge sharing and cooperation for access to science, technology and innovation"),
    ("17.7", "17.7 Promote sustainable technologies to developing countries"),
    ("17.8", "17.8 Strengthen the participation in global governance"),
          ("17.9", "17.9 Enhanced SDG capacity in developing countries"),
               ("17.10", "17.10 Promote a universal trading system under the WTO"),   
    ("17.11", "17.11 Increase the exports of developing countries"),
    ("17.12", "17.12 Remove trade barriers for least-developed countries"),
    ("17.13", "17.13 Enhance global macroeconomic stability"),
    ("17.14", "17.14 Enhance policy coherence for sustainable development"),
    ("17.15", "17.15 Respect national leadership to implement policies for the sustainable development goals"),
    ("17.16", "17.16 Enhance the global partnership for sustainable development"),
    ("17.17", "17.17 Encourage effective partnerships"),
    ("17.18", "17.18 Enhance availability of reliable data"),
    ("17.19", "17.19 Further develop measurements of progress")
)


Reference_CHOICES = {
    ("0", 'Tahl Kestin (2015), "SDG Keywords list". Monash University and SDSN Australia/Pacific.'),
    ('1', 'Habits of Mind: A Developmental Series, http://www.chsvt.org/wdp/Habits_of_Mind.pdf'),
    ('2', 'PRME Business School 2019 Annual Report'),
    ('3', '2020.10 Digital Sustainability Full Report'),
    ('4', 'HERDSA Webinar: Sustainability in Learning and Teaching: Making It Happen'),
    ('5', 'The Carbon Literacy Project'),
    ('6', 'RACE planning framework'),
    ('7', 'Jayabalasingham, Bamini; Boverhof, Roy; Agnew, Kevin; Klein, L (2019), “Identifying research supporting the United Nations Sustainable Development Goals”, Mendeley Data, V1, doi: 10.17632/87txkw7khs.1'),
    ('8', 'http://socialicense.com/definition.html'),
    ('9', 'Consumer Responses to Energy Efficiency: Political ideology affects energy-efficiency attitudes and choices'),
    ('10', '1ESG: http://corporatefinanceinstitute.com/resources/knowledge/other/esg-environmental-social-governance/'),
    ('11', '1http://en.wikipedia.org/wiki/Left-behind_children_in_China'),
    ('12', '1http://www1.nyc.gov/assets/dca/downloads/pdf/partners/Study-of-Gender-Pricing-in-NYC.pdf'),
    # ('13', '13. Bushfire'),
    ('14', '2020 Mapping research for the Sustainable Development Goals'),
    ('15', 'Wersun, Alec, Johanna Klatt, Fara Azmat, Harsh Suri, Christian Hauser, Jill Bogie, Mark Meaney and Nikolay Ivanov, "Blueprint for SDG Intergration into Curriculum, research and partnerships," PRME. July 2020'),
    ('16', 'Sustainability science report'),
    ('17', 'The Big Benchmarking Tool  http://hksaperstein.github.io/The-Big-Benchmarking-Tool/html/index.html'),
    ('18', 'The Sustainable Development Goals Report 2020 (progress)'),
    ('19', 'UN 2030 Agenda and 169 targets http://sdgs.un.org/2030agenda'),
    ('20', 'SDGs Australian progress: http://www.sdgtransformingaustralia.com/#/1242/1366/'),
    ('21', 'Pandemic hit academic mothers especially hard, new data confirm, By Katie LanginFeb. 9, 2021'),
    ('22', 'Anne Revillard, "The disability employment quota, between social policy and antidiscrimination", working paper.'),
    ('23', "Jerome D. Williams, Sterling A. Bone, Glenn L. Christensen, Alexandra Tebbs (2020),'Profiting from Protecting Small Business Borrowers: Take That to the Bank!'"),
    ('24', 'Kopnina, H., 2020. Education for the future? Critical evaluation of education for sustainable development goals. The Journal of Environmental Education, 51(4), pp.280-291.'),
    ('25', '9 in 10 Australian consumers would purchase ethical and sustainable products, http://www.couriersplease.com.au/about/media-release'),
    ('26', 'CB Bhattacharya. In Business, Sustainability Starts With Purpose. http://www.aacsb.edu/insights/2021/February/in-business-sustainability-starts-with-purpose'),
    ('27', 'Lane Cove Council Coping with Climate Change'),
    ('28', 'http://www.nokidhungry.org/'),
    ('29', 'Yolande Strengers and Jenny Kennedy (2020), "The Smart Wife: Why Siri, Alexa, and Other Smart Home Devices Need a Feminist Reboot". book. ISBN: 9780262044370'),
    ('30', "Alexandra Smith (2020), Enormous opportunities': NSW's green economic recovery from COVID-19, The Sydney Morning Herarld, Sep 9, 2020."),
    ('31', 'Peck J, Kirk CP, Luangrath AW, Shu SB. Caring for the Commons: Using Psychological Ownership to Enhance Stewardship Behavior for Public Goods. Journal of Marketing. 2021;85(2):33-49. doi:10.1177/0022242920952084'),
    ('32', 'http://sydneyediblegardentrail.com/'),
    ('33', 'Julie Power (2021), "Fake grass may be greener, but much hotter and less friendly to environment," March 14, 2021, The Sydney Morning Herald.'),
    ('34', 'How can Artificial Intelligence reduce disaster risks in countries? http://aiforgood.itu.int/events/how-can-artificial-intelligence-and-digital-technologies-reduce-disaster-risks-in-countries/'),
    ('35', 'UNSW Equity diversity and inclusion. http://www.edi.unsw.edu.au/sexual-misconduct'),
    ('36', 'Towards Responsible AI for Disaster Risk Management. http://aiforgood.itu.int/events/towards-responsible-ai-for-disaster-risk-management/'),
    ('37', 'Could COVID-19 be a turning point for ESG in China? http://www.businessthink.unsw.edu.au/articles/coronavirus-ESG-investments-china?mc_cid=fb3a8db86c&mc_eid=487abe20df'),
    ('38', 'Grewal, L., Hmurovic, J., Lamberton, C. and Reczek, R., 2018. The Self-Perception Connection: Why Consumers Devalue Unattractive Produce. Journal of Marketing, 83(1), pp.89-107.'),
    ('39', 'Anna Skarbek (2021), "One overarching ask for business and investors: Do you have a plan to achieve zero emissions?" http://lens.monash.edu/@business-economy/2020/01/28/1379570/one-overarching-ask-for-business-and-investors-have-you-got-a-plan-to-get-to-zero-emissions'),
    ('40', 'Sustainable fashion: How the fashion industry can urgently act to reduce its greenhouse gas emission. http://www.mckinsey.com/about-us/covid-response-center/leadership-mindsets/webinars/sustainable-fashion-how-the-fashion-industry-can-urgently-act-to-reduce-its-greenhouse-gas-emission'),
    ('41', 'Agenda 21 http://sustainabledevelopment.un.org/content/documents/Agenda21.pdf')

}


# my dummy model
class DummyModel(models.Model):

    class Meta:
        verbose_name_plural = 'Dummy Model'
        app_label = 'sample'
        
# class MyAdminSite(AdminSite):
#     site_header = 'console'

# Create your models here.
class Keyword(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices=SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)
    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/adding" target="blank">Add Keyword</a>')
    pdf_link.short_description = ('Add New')
    def __self__(self):
        return self.keyword
    
    class Meta: 
        verbose_name_plural = 'Adding Keywords'

class SDG1_Target(models.Model):

    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG1_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )
    
    note = models.CharField(default="", max_length=200)

    def get_target():
        return self.target

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg1" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

    def __self__(self):
        return "Panel 1"

    class Meta:
        verbose_name_plural = '01. SDG 1 No Poverty'

class SDG2_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG2_Small_Target)

    note = models.CharField(default="", max_length=200)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )
    
    def __self__(self):
        return self.keyword 
    
    class Meta:
        verbose_name_plural = '02. SDG 2 Zero Hunger'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg2" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG3_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG3_Small_Target)
    
    note = models.CharField(default="", max_length=200)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )
    
    def __self__(self):
        return self.keyword 
    
    class Meta:
        verbose_name_plural = '03. SDG 3 Good Health and Well-being'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg3" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG4_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG4_Small_Target)

    note = models.CharField(default="", max_length=200)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )
    
    class Meta:
        verbose_name_plural = '04. SDG 4 Quality Education'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg4" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG5_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG5_Small_Target)

    note = models.CharField(default="", max_length=200)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )
    
    class Meta:
        verbose_name_plural = '05. SDG 5 Gender Equality'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg5" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG6_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)

    note = models.CharField(default="", max_length=200)
    
    target = models.CharField(default="", max_length=200, choices=SDG6_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )
    
    class Meta:
        verbose_name_plural = '06. SDG 6 Clean Water and Sanitation'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg6" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG7_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG7_Small_Target)

    note = models.CharField(default="", max_length=200)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )
    
    class Meta:
    
        verbose_name_plural = '07. SDG 7 Affordable and Clean Energy'


    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg7" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG8_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG8_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)
    
    class Meta:
    
        verbose_name_plural = '08. SDG 8 Decent Work and Economic Growth'


    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg8" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG9_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG9_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)
    
    class Meta:
    
        verbose_name_plural = '09. SDG 9 Industry, Innovation and Infrastructure'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg9" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG10_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG10_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)
    
    class Meta:
    
        verbose_name_plural = '10. SDG 10 Reduced Inequalities'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg10" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG11_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG11_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)
    
    class Meta:
    
        verbose_name_plural = '11. SDG 11 Sustainable Cities and Communities'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg11" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG12_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG12_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)
    
    class Meta:
    
        verbose_name_plural = '12. SDG 12 Responsible Consumption and Production'


    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg12" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG13_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG13_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)
    
    class Meta:
    
        verbose_name_plural = '13. SDG 13 Climate Action'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg13" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG14_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG14_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)
    
    class Meta:
    
        verbose_name_plural = '14. SDG 14 Life Below Water'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg14" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG15_Target(models.Model):
    
    keyword = models.CharField(max_length=200)
    
    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)
    
    target = models.CharField(default="", max_length=200, choices=SDG15_Small_Target)
    
    reference1 = models.CharField(default="", max_length=300 )
    
    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)
    
    class Meta:
        verbose_name_plural = '15. SDG 15 Life on Land'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg15" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG16_Target(models.Model):

    keyword = models.CharField(max_length=200)

    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)

    target = models.CharField(default="", max_length=200, choices=SDG16_Small_Target)

    reference1 = models.CharField(default="", max_length=300 )

    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)

    class Meta:

        verbose_name_plural = '16. SDG 16 Justice, Peace and Strong Institutions'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg16" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class SDG17_Target(models.Model):

    keyword = models.CharField(max_length=200)

    sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)

    target = models.CharField(default="", max_length=200, choices=SDG17_Small_Target)

    reference1 = models.CharField(default="", max_length=300 )

    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)

    class Meta:

        verbose_name_plural = '17. SDG 17 Partnership for the Goals'

    def pdf_link(self):
        return mark_safe('<a class="grp-button" href="http://sdg.unswzoo.com/sdg17" target="blank">View</a>')

    pdf_link.short_description = ('Target Detail')

class Digital_Keywords(models.Model):

    keyword = models.CharField(max_length=200)

    reference1 = models.CharField(default="", max_length=300 )

    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)

    class Meta:
        verbose_name_plural = '19. Digital sustainability keywords'

# class Compiled_SDG_Keywords(models.Model):

#     keyword = models.CharField(max_length=200)

#     sdggoal = models.CharField(default="", max_length=300, choices = SDGTarget_CHOICES)

#     target = models.CharField(default="", max_length=200)

#     class Meta:

#         verbose_name_plural = '19. Compiled SDG Keywords'

class keywords_related_to_all_SDGs(models.Model):

    keyword = models.CharField(max_length=100)

    reference1 = models.CharField(default="", max_length=300 )

    reference2 = models.CharField(default="", max_length=300 )

    note = models.CharField(default="", max_length=200)

    class Meta:

        verbose_name_plural = '18. keyword related to all SDGs'

class References(models.Model):

    # source_no = models.CharField(default="", max_length=300)
    source = models.CharField(default="", max_length=300, editable = True)
    
    class Meta:
        verbose_name_plural = '20. Sources'