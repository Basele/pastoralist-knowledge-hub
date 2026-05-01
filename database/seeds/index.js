const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Pastoralist Indigenous Knowledge Hub...');

  // ── Communities ────────────────────────────────────────────────────────────
  const maasai = await prisma.community.upsert({
    where: { id: 'aaaaaaaa-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: 'aaaaaaaa-0000-0000-0000-000000000001',
      name: 'Maasai Community — Kajiado',
      nameSwahili: 'Jamii ya Wamasai — Kajiado',
      description: 'The Maasai are a Nilotic ethnic group inhabiting southern Kenya and northern Tanzania. Known for their distinctive customs and close ties with their cattle.',
      descriptionSwahili: 'Wamasai ni kikundi cha Kinailoti kinachokaa kusini mwa Kenya na kaskazini mwa Tanzania. Wanajulikana kwa desturi zao za kipekee na uhusiano wao wa karibu na ng\'ombe wao.',
      region: 'Kajiado County',
      country: 'Kenya',
    },
  });

  const turkana = await prisma.community.upsert({
    where: { id: 'aaaaaaaa-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: 'aaaaaaaa-0000-0000-0000-000000000002',
      name: 'Turkana Community — Lodwar',
      nameSwahili: 'Jamii ya Waturkana — Lodwar',
      description: 'The Turkana are a Nilotic people of northwestern Kenya. Semi-nomadic pastoralists who herd cattle, camels, donkeys, and goats across arid landscapes.',
      descriptionSwahili: 'Waturkana ni watu wa Kinailoti wa kaskazini-magharibi mwa Kenya. Wafugaji wa kuhamahama wanaofuga ng\'ombe, ngamia, punda, na mbuzi katika mandhari kame.',
      region: 'Turkana County',
      country: 'Kenya',
    },
  });

  const borana = await prisma.community.upsert({
    where: { id: 'aaaaaaaa-0000-0000-0000-000000000003' },
    update: {},
    create: {
      id: 'aaaaaaaa-0000-0000-0000-000000000003',
      name: 'Borana Community — Marsabit',
      nameSwahili: 'Jamii ya Waborana — Marsabit',
      description: 'The Borana are an Oromo people of southern Ethiopia and northern Kenya. Expert camel and cattle herders with sophisticated traditional governance systems.',
      region: 'Marsabit County',
      country: 'Kenya',
    },
  });

  console.log('✅ Communities created');

  // ── Users ──────────────────────────────────────────────────────────────────
  const pw = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pikh.org' },
    update: {},
    create: {
      email: 'admin@pikh.org',
      passwordHash: pw,
      name: 'Hub Administrator',
      role: 'SUPER_ADMIN',
      accessTier: 'SACRED',
      isVerified: true,
    },
  });

  const elder1 = await prisma.user.upsert({
    where: { email: 'elder.ole.nkoko@pikh.org' },
    update: {},
    create: {
      email: 'elder.ole.nkoko@pikh.org',
      passwordHash: pw,
      name: 'Elder Ole Nkoko',
      nameSwahili: 'Mzee Ole Nkoko',
      role: 'ELDER_CUSTODIAN',
      accessTier: 'ELDER',
      communityId: maasai.id,
      isVerified: true,
      bio: 'Elder and keeper of Maasai pastoral traditions. Over 40 years of knowledge on cattle routes and seasonal grazing.',
      bioSwahili: 'Mzee na mlezi wa mila za ufugaji wa Wamasai. Zaidi ya miaka 40 ya ujuzi juu ya njia za ng\'ombe na malisho ya msimu.',
    },
  });

  const member1 = await prisma.user.upsert({
    where: { email: 'amina.lokiru@pikh.org' },
    update: {},
    create: {
      email: 'amina.lokiru@pikh.org',
      passwordHash: pw,
      name: 'Amina Lokiru',
      role: 'COMMUNITY_MEMBER',
      accessTier: 'COMMUNITY',
      communityId: turkana.id,
      isVerified: true,
    },
  });

  const researcher = await prisma.user.upsert({
    where: { email: 'researcher@university.ac.ke' },
    update: {},
    create: {
      email: 'researcher@university.ac.ke',
      passwordHash: pw,
      name: 'Dr. Sarah Wanjiku',
      role: 'RESEARCHER',
      accessTier: 'COMMUNITY',
      isVerified: true,
    },
  });

  console.log('✅ Users created');

  // ── Locations ──────────────────────────────────────────────────────────────
  const amboseli = await prisma.location.create({
    data: {
      name: 'Amboseli Grazing Plains',
      nameSwahili: 'Maeneo ya Malisho ya Amboseli',
      description: 'Seasonal grazing land used by Maasai during the long rains. Rich in grass species favored by cattle.',
      locationType: 'GRAZING_LAND',
      latitude: -2.6527,
      longitude: 37.2606,
      country: 'Kenya',
      region: 'Kajiado County',
      communityId: maasai.id,
      isSeasonalWater: false,
      seasonAvailable: 'March–May, October–December',
    },
  });

  const loiyangalani = await prisma.location.create({
    data: {
      name: 'Loiyangalani Water Point — Lake Turkana',
      nameSwahili: 'Chanzo cha Maji cha Loiyangalani — Ziwa Turkana',
      description: 'Critical dry-season water source for Turkana herders. Used for over 200 years.',
      locationType: 'WATER_POINT',
      latitude: 2.7572,
      longitude: 36.7113,
      country: 'Kenya',
      region: 'Marsabit County',
      communityId: turkana.id,
      isSeasonalWater: false,
    },
  });

  const northernRoute = await prisma.location.create({
    data: {
      name: 'Northern Corridor Migration Route',
      nameSwahili: 'Njia ya Uhamaji ya Kaskazini',
      description: 'Traditional cattle migration route from Marsabit to Isiolo, used during drought years when southern pastures fail.',
      locationType: 'MIGRATION_ROUTE',
      latitude: 2.3384,
      longitude: 37.9899,
      geojson: {
        type: 'LineString',
        coordinates: [[37.9899, 2.3384], [37.5823, 1.8823], [37.2700, 0.3556]],
      },
      country: 'Kenya',
      region: 'Northern Kenya',
      communityId: borana.id,
    },
  });

  const sacredHill = await prisma.location.create({
    data: {
      name: 'Ol Doinyo Orok Sacred Hills',
      nameSwahili: 'Milima Mitakatifu ya Ol Doinyo Orok',
      description: 'Sacred hills used for traditional Maasai ceremonies and communal prayers for rain.',
      locationType: 'SACRED_SITE',
      latitude: -2.4801,
      longitude: 36.9523,
      country: 'Kenya',
      region: 'Kajiado County',
      communityId: maasai.id,
    },
  });

  console.log('✅ Locations created');

  // ── Knowledge Records ──────────────────────────────────────────────────────
  const records = [
    {
      title: 'Reading the Sky: Maasai Weather Prediction Methods',
      titleSwahili: 'Kusoma Anga: Mbinu za Kutabiri Hali ya Hewa za Wamasai',
      description: 'Traditional methods used by Maasai elders to predict rainfall, drought, and seasonal changes using cloud formations, wind patterns, and animal behavior.',
      descriptionSwahili: 'Mbinu za jadi zinazotumiwa na wazee wa Wamasai kutabiri mvua, ukame, na mabadiliko ya msimu kwa kutumia mifumo ya mawingu, mwelekeo wa upepo, na tabia za wanyama.',
      content: `The Maasai have developed sophisticated weather prediction techniques over centuries of living in semi-arid environments. Elders known as "il-oiboni" (spiritual leaders and forecasters) are the primary practitioners of these methods.

**Cloud Reading (Enkiama)**
When cumulus clouds build from the east in the morning and turn dark grey by midday, heavy rain is expected within 24–48 hours. If the clouds dissipate by noon, dry conditions will persist.

**Wind Patterns (Enkijabe)**
A persistent southeasterly wind (enkijabe e-naipolos) during April indicates good long-rain season ahead. Northerly winds during the same period signal a failed season.

**Animal Behavior Indicators**
- Ants moving eggs to higher ground: rain within 3 days
- Cattle refusing to leave the boma (homestead) in morning: rain imminent
- Increased activity of dung beetles: seasonal rains approaching
- Birds of the oxpecker species flying in unusual formations: drought coming

**Plant Indicators**
The blooming of the acacia xanthophloea (fever tree) one month before expected rains is considered a reliable indicator used by elders to advise the community on migration timing.

**Practical Application**
These forecasts guide decisions on when to move livestock, which routes to take, and when to begin preparing water storage. Communities share forecast information through the enkiama age-grade system.`,
      contentSwahili: `Wamasai wamekuza mbinu za kisasa za kutabiri hali ya hewa kwa karne nyingi za kuishi katika mazingira ya nusu-kame. Wazee wanaojulikana kama "il-oiboni" (viongozi wa kiroho na watabiri) ndio watendaji wakuu wa mbinu hizi.

**Kusoma Mawingu (Enkiama)**
Wakati mawingu ya cumulus yanajengwa kutoka mashariki asubuhi na kugeuka kijivu giza saa sita, mvua nzito inatarajiwa ndani ya masaa 24-48. Ikiwa mawingu yatatoweka saa sita, hali ya ukame itaendelea.

**Mifumo ya Upepo (Enkijabe)**
Upepo wa kudumu wa kusini-mashariki wakati wa Aprili unaonyesha msimu mzuri wa mvua za masika. Upepo wa kaskazini wakati huo huo unaashiria msimu mbaya.`,
      category: 'WEATHER_PREDICTION',
      accessTier: 'PUBLIC',
      status: 'APPROVED',
      tags: ['weather', 'forecasting', 'clouds', 'animals', 'plants', 'maasai'],
      tagsSwahili: ['hali ya hewa', 'utabiri', 'mawingu', 'wanyama', 'mimea'],
      seasonality: 'March–May (Long rains), October–December (Short rains)',
      source: 'Elder Ole Nkoko, compiled 2023',
      culturalContext: 'Weather prediction is a sacred responsibility held by the il-oiboni. Sharing this knowledge externally was discussed with community elders and approved for public documentation to help climate adaptation efforts.',
      contributorId: elder1.id,
      communityId: maasai.id,
      locationId: amboseli.id,
      verifiedByElder: true,
    },
    {
      title: 'Turkana Camel Husbandry and Desert Survival',
      titleSwahili: 'Ufugaji wa Ngamia wa Waturkana na Kuishi Jangwani',
      description: 'Comprehensive traditional knowledge on camel breeding, health management, and the role of camels in Turkana survival during extreme drought.',
      descriptionSwahili: 'Maarifa ya jadi ya kina kuhusu kuzaliana kwa ngamia, usimamizi wa afya, na jukumu la ngamia katika maisha ya Waturkana wakati wa ukame mkubwa.',
      content: `The Turkana people have herded camels (ekaal) for centuries, and their knowledge of camel management is among the most sophisticated in East Africa.

**Breed Selection**
Turkana herders maintain three primary camel breeds:
- Rendille-type: smaller, better milk producers in harsh conditions
- Northern (Somali-type): larger, better for long-distance trekking
- Mixed breeds: most common, selected for local adaptability

**Health Indicators**
Experienced herders assess camel health through:
- Hump firmness: firm hump indicates good fat reserves
- Eye clarity: cloudy eyes indicate dehydration or trypanosomiasis
- Gum color: pale gums signal anemia from tick infestation
- Gait analysis: slight limping often precedes foot rot in wet season

**Traditional Medicine**
Several plants are used in traditional camel healthcare:
- Boscia coriacea (Tuyur): bark decoction for respiratory illness
- Cadaba farinosa (Lakweten): leaf paste for wounds and skin infections
- Acacia tortilis (Ekwar): pods as high-energy feed supplement during drought

**Water Management**
Turkana herders can accurately predict a camel's water needs based on season, load, and distance. A healthy camel can travel 5–7 days without water in cool season, 3–4 days in hot season.

**Drought Protocol**
When pasture fails, the Turkana follow a strict herd management protocol:
1. Disperse herds across wider area to prevent overgrazing
2. Sacrifice weak or old animals to reduce herd water needs
3. Move lactating females and young to best available water first
4. Send scouts (ngimurok) 3–4 days ahead to locate water and pasture`,
      category: 'LIVESTOCK_MANAGEMENT',
      accessTier: 'COMMUNITY',
      status: 'APPROVED',
      tags: ['camel', 'drought', 'livestock', 'health', 'turkana', 'desert'],
      tagsSwahili: ['ngamia', 'ukame', 'mifugo', 'afya', 'jangwa'],
      seasonality: 'Year-round, critical during dry season (Jan–Mar, Jul–Sep)',
      source: 'Amina Lokiru, community elders consultation 2023',
      contributorId: member1.id,
      communityId: turkana.id,
      locationId: loiyangalani.id,
    },
    {
      title: 'Medicinal Plants of the Borana Pastoralists',
      titleSwahili: 'Mimea ya Dawa ya Wafugaji wa Waborana',
      description: 'Documented traditional plant medicines used by Borana healers for both human and livestock health, with preparation methods and dosages.',
      category: 'MEDICINAL_PLANTS',
      accessTier: 'COMMUNITY',
      status: 'APPROVED',
      content: `The Borana maintain a rich pharmacopoeia of medicinal plants, carefully passed from healer to healer across generations. The "Hayu" (traditional healer) holds this knowledge in trust for the community.

**Key Medicinal Plants**

Commiphora myrrha (Qafal):
- Use: Wound healing, fever reduction
- Preparation: Resin dissolved in warm water, applied topically for wounds; small amount ingested for fever
- Dosage: Apply to wounds twice daily; ingest teaspoon of dissolved resin with water morning and evening

Acacia nilotica (Barqiqa):
- Use: Diarrhea, stomach ailments in both humans and livestock
- Preparation: Bark boiled in water for 20 minutes
- Dosage: Half cup twice daily for adults; quarter cup for children

Salvadora persica (Miswak/Barquqo):
- Use: Dental hygiene, gum disease
- Preparation: Fresh twigs chewed at one end to form bristles
- Note: Also used as a natural antibiotic for mouth wounds in cattle

Aloe vera (Galaan):
- Use: Burns, skin conditions, eye infections in livestock
- Preparation: Fresh gel extracted from leaf
- Dosage: Apply directly to affected area 2-3 times daily

**Important Protocols**
Access to this knowledge is governed by the Gada system. Some plants require the healer to recite specific prayers during preparation. The community has approved general documentation of these plants but specific sacred preparation rituals are not included here.`,
      tags: ['plants', 'medicine', 'healing', 'borana', 'traditional'],
      tagsSwahili: ['mimea', 'dawa', 'uponyaji', 'jadi'],
      source: 'Community healer documentation project, 2022',
      contributorId: member1.id,
      communityId: borana.id,
    },
    {
      title: 'The Maasai Boma: Traditional Settlement Design for Livestock Security',
      titleSwahili: 'Boma ya Wamasai: Muundo wa Makazi ya Jadi kwa Usalama wa Mifugo',
      description: 'The architecture and spatial logic of the traditional Maasai boma, designed to protect livestock from predators while managing herd health.',
      category: 'ECOLOGICAL_KNOWLEDGE',
      accessTier: 'PUBLIC',
      status: 'APPROVED',
      content: `The Maasai boma (enkang) is a sophisticated circular settlement that encodes centuries of knowledge about livestock protection, community organization, and environmental management.

**Physical Design**
A traditional boma consists of:
- Outer fence (enkiama): made from thorny acacia branches stacked 6–8 feet high, oriented to prevailing wind
- Inner cattle enclosure (osim): central position, largest space
- Individual family huts arranged around the inner circle, door facing inward
- Calf enclosure attached to each hut for nighttime protection
- Single entrance gap, deliberately narrow to force single-file entry

**Predator Deterrence Logic**
The thorn fence is constructed with branches interlocking outward (spines pointing out). The design creates:
- No handholds for climbing predators
- Noise when disturbed, alerting warriors sleeping nearby
- Seasonal reinforcement where predator pressure is highest

**Herd Health Benefits**
The circular design separates different age groups of cattle:
- Calves nearest to houses (most vulnerable, highest monitoring)
- Lactating cows near the back (quiet area, reduced stress)
- Bulls and dry cows toward the entrance

**Water and Waste Management**
The boma is positioned to allow natural drainage away from sleeping areas. Cattle dung accumulates in the center and is periodically spread on nearby vegetation as a traditional soil amendment practice.

**Relocation Knowledge**
Temporary bomas for migration stopovers can be constructed in 4–5 hours by a group of 10 warriors. Site selection criteria include: elevation (for drainage), proximity to water (but not too close to avoid predator ambush), downwind from water source.`,
      tags: ['boma', 'settlement', 'design', 'predators', 'livestock', 'architecture'],
      tagsSwahili: ['boma', 'makazi', 'muundo', 'wanyama wakali', 'mifugo'],
      source: 'Collaborative documentation with Elder Ole Nkoko, 2023',
      contributorId: elder1.id,
      communityId: maasai.id,
      locationId: amboseli.id,
      verifiedByElder: true,
    },
    {
      title: 'Traditional Conflict Resolution: The Maasai Enkiama Council',
      titleSwahili: 'Utatuzi wa Migogoro wa Jadi: Baraza la Enkiama la Wamasai',
      description: 'The traditional governance system used by Maasai elders to resolve land and resource disputes between pastoralist communities without formal courts.',
      category: 'CONFLICT_RESOLUTION',
      accessTier: 'COMMUNITY',
      status: 'APPROVED',
      content: `The Maasai enkiama (council of elders) has served as the primary mechanism for conflict resolution for centuries, handling disputes over grazing rights, water access, and inter-community tensions.

**Structure**
- Junior elders (Ilkiama): manage day-to-day community disputes
- Senior elders (Iltasat): handle major resource conflicts and inter-community matters
- Retired elders (Ilaigwenak): serve as supreme arbiters in deadlocked cases

**Process**
1. Complaint is brought to the nearest junior elder
2. Both parties present their case, each accompanied by witnesses
3. Deliberation period: typically 2–7 days for minor disputes
4. Decision is delivered publicly at sunrise (symbolically neutral time)
5. Compensation agreed upon: typically in cattle, number determined by severity
6. Both parties seal agreement with shared cup of milk (enkare naibor)

**Grazing Rights Disputes**
The most common disputes involve overlapping grazing areas. Traditional resolution acknowledges:
- Historical use rights (enkiama e-ndaa): who used an area first
- Drought emergency rights: any herd may use any water point in extreme drought
- Dry season reserve areas: certain zones set aside by elders for emergency use only

**Cross-Community Disputes**
When disputes involve different ethnic groups (e.g., Maasai and Turkana), a joint council is convened with representatives from both groups. A neutral elder from a third community may be invited to mediate.`,
      tags: ['governance', 'conflict', 'elders', 'council', 'land rights', 'mediation'],
      tagsSwahili: ['utawala', 'migogoro', 'wazee', 'baraza', 'ardhi'],
      source: 'Elder Ole Nkoko and community governance documentation, 2023',
      contributorId: elder1.id,
      communityId: maasai.id,
    },
    {
      title: 'Turkana Drought Survival: The Ngimurok Scout System',
      titleSwahili: 'Kuishi Ukame kwa Waturkana: Mfumo wa Wapelelezi wa Ngimurok',
      description: 'The traditional Turkana scouting system for locating water, pasture, and safe migration routes during drought emergencies.',
      category: 'GRAZING_ROUTES',
      accessTier: 'PUBLIC',
      status: 'APPROVED',
      content: `The ngimurok (scouts) are specialized community members trained from youth to locate water and pasture. During droughts, they are the most critical asset a Turkana family possesses.

**Selection and Training**
Scouts are identified in early adolescence based on:
- Exceptional navigation and memory skills
- Physical endurance
- Calm temperament under stress
- Knowledge of star navigation

Training occurs over 5–7 years, accompanying experienced scouts on progressively longer expeditions.

**Scouting Methods**

Water Location:
- Following animal tracks to water sources (especially elephants and baboons)
- Reading geological formations: dry riverbeds, rock depressions
- Observing bird flight patterns at dawn and dusk (birds fly toward water)
- Underground water detection: certain plants (Salvadora persica, desert date) indicate subsurface water
- Reading sand moisture at depth (digging test pits 30–50cm)

Pasture Assessment:
- Grass density and species composition
- Soil color and composition (red soil retains moisture better)
- Presence of indicator species: Aristida grass signals overgrazed area, Cenchrus species signals good pasture

**Communication System**
Scouts use smoke signals (day) and fire signals (night) to communicate findings:
- Single column of smoke: water found, safe
- Two columns: pasture found, good conditions
- Rapid smoke puffs: danger (hostile groups or predators)

**Modern Integration**
Some communities now use mobile phones to relay scout information, but traditional signaling remains the backup when networks fail — which is frequent in remote areas.`,
      tags: ['scouts', 'drought', 'water', 'navigation', 'migration', 'turkana'],
      tagsSwahili: ['wapelelezi', 'ukame', 'maji', 'urambazaji', 'uhamaji'],
      source: 'Amina Lokiru, interviews with ngimurok elders 2022',
      contributorId: member1.id,
      communityId: turkana.id,
      locationId: northernRoute.id,
    },
  ];

  for (const record of records) {
    await prisma.knowledgeRecord.create({ data: record });
    process.stdout.write('.');
  }

  console.log('\n✅ Knowledge records created');

  // ── Notifications (sample) ─────────────────────────────────────────────────
  await prisma.notification.create({
    data: {
      userId: elder1.id,
      type: 'WELCOME',
      title: 'Welcome to PIK Hub',
      message: 'Your elder custodian account has been activated. You can now review and approve knowledge submissions from your community.',
      isRead: false,
    },
  });

  console.log('\n🎉 Seeding complete!');
  console.log('\nTest accounts:');
  console.log('  admin@pikh.org         / password123  (Super Admin)');
  console.log('  elder.ole.nkoko@pikh.org / password123  (Elder Custodian)');
  console.log('  amina.lokiru@pikh.org  / password123  (Community Member)');
  console.log('  researcher@university.ac.ke / password123  (Researcher)');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
