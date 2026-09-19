window.TREE_GOV_MODEL = {
  "metadata": {
    "title": "Amsterdam Tree Governance Explorer",
    "version": "0.2.0",
    "date": "2026-09-19",
    "scope": "Municipal management of public trees in Amsterdam; interpretive research model.",
    "schema": "Typed property graph. Nodes = actors, processes, data/objects, rules and ecological objects. Edges = typed relations with provenance, basis and confidence.",
    "caveat": "This is a research synthesis, not an official City of Amsterdam organization chart. Some relations are explicit in sources; others are marked as synthesis.",
    "repository": "https://github.com/spoonforks/TreeGovernance",
    "canonicalData": "data/model.json"
  },
  "sources": [
    {
      "id": "S1",
      "title": "Bomen | Gemeente Amsterdam",
      "url": "https://www.amsterdam.nl/leefomgeving/groen/bomen/",
      "note": "Municipal overview of tree management, Bomenkaart, inspection, felling, replacement and ecological deadwood."
    },
    {
      "id": "S2",
      "title": "De Bomenkaart van Gemeente Amsterdam",
      "url": "https://bomen.amsterdam.nl/",
      "note": "Public tree asset map / tree passports, inspections, maintenance tasks and citizen reporting."
    },
    {
      "id": "S3",
      "title": "Amsterdam Datapunt API - bomen",
      "url": "https://api.data.amsterdam.nl/v1/docs/datasets/bomen.html",
      "note": "Public tree dataset; source system GISIB; ownership and data-team provenance."
    },
    {
      "id": "S4",
      "title": "Route van de boom | Gemeente Amsterdam",
      "url": "https://www.amsterdam.nl/leefomgeving/groen/bomen/route-boom/",
      "note": "Tree lifecycle overview; contractors care for newly planted trees during the first four years, followed by municipal management."
    },
    {
      "id": "S5",
      "title": "Puccinimethode | Gemeente Amsterdam",
      "url": "https://www.amsterdam.nl/leefomgeving/puccinimethode/puccinimethode/",
      "note": "Public-space design standard; includes Hoofdbomenstructuur and Handboek Groen."
    },
    {
      "id": "S6",
      "title": "Beleidskader Puccinimethode 2023/2024",
      "url": "https://assets.amsterdam.nl/publish/pages/910820/beleidskader_puccinimethode_2024_.pdf",
      "note": "Biodiversity, tree design standards, ecological green, and city-ecologist advice at project level."
    },
    {
      "id": "S7",
      "title": "Biodiversiteit | Gemeente Amsterdam",
      "url": "https://www.amsterdam.nl/bestuur-organisatie/beleid/biodiversiteit/",
      "note": "Municipal biodiversity goals, ecological management and protected green structure."
    },
    {
      "id": "S8",
      "title": "Bomenverordening 2024",
      "url": "https://lokaleregelgeving.overheid.nl/CVDR713836/",
      "note": "Current municipal tree ordinance and legal framework for protected tree stock."
    },
    {
      "id": "S9",
      "title": "Boom kappen of snoeien | Gemeente Amsterdam",
      "url": "https://www.amsterdam.nl/wonen-bouwen-verbouwen/bouwen-verbouwen/omgevingsvergunning/boom-kappen-of-snoeien/",
      "note": "Permit requirements, replanting/compensation, objection and procedural information."
    },
    {
      "id": "S10",
      "title": "Rekenkamer Amsterdam - Onderzoeksopzet Bomenbeleid (2025)",
      "url": "https://www.rekenkamer.amsterdam.nl/documenten/onderzoeksopzet-bomenbeleid/",
      "note": "Recent synthesis of Amsterdam tree-policy objectives, permit regime, maintenance backlog and replanting issues."
    },
    {
      "id": "S11",
      "title": "Medewerker Ecologisch Beheer & Participatie | Werken bij Amsterdam",
      "url": "https://werkenbij.amsterdam.nl/vacatures/medewerker-ecologisch-beheer-participatie-124bc759-353c-4ea6-b0e0-de244ba87990",
      "note": "Describes Stadswerken and Groen, Flora en Fauna responsibility for daily park/tree/green maintenance."
    },
    {
      "id": "S12",
      "title": "Teammanager Bomen | Werken bij Amsterdam",
      "url": "https://werkenbij.amsterdam.nl/vacatures/teammanager-bomen-747f8dcd-f507-4dbd-bf43-b5b7acc7e356",
      "note": "Describes Team Bomen work with specialist tree contracts, inspections, felling/replanting procedures and emergency services."
    },
    {
      "id": "S13",
      "title": "Participatieplan beheerplannen Bosplantsoen (2025)",
      "url": "https://assets.amsterdam.nl/publish/pages/1075979/participatieplan_beheerplannen_bosplantsoen.pdf",
      "note": "Shows how V&OR, Stadswerken, district boards, experts and residents interact in forest-planting management plans."
    },
    {
      "id": "S14",
      "title": "Bomen langs zwakke kades behouden | Gemeente Amsterdam",
      "url": "https://www.amsterdam.nl/verkeer-vervoer/bruggen-kademuren/bomen-langs-zwakke-kades-behouden/",
      "note": "Example of Tree Effect Analysis (BEA) before major public works."
    },
    {
      "id": "S15",
      "title": "Bomenboekhouding | Gemeente Amsterdam",
      "url": "https://www.amsterdam.nl/leefomgeving/groen/bomen/bomenboekhouding/",
      "note": "Public accounting of permit applications, approvals/refusals and replacement planting."
    },
    {
      "id": "S16",
      "title": "Monitor Groen 2024 | Onderzoek en Statistiek",
      "url": "https://onderzoek.amsterdam.nl/publicatie/monitor-groen-2024",
      "note": "City-level green monitoring, including canopy-cover indicators."
    },
    {
      "id": "S17",
      "title": "Omgevingsvisie Amsterdam 2050",
      "url": "https://www.amsterdam.nl/bestuur-organisatie/beleid/omgevingsvisie-amsterdam-2050/",
      "note": "Strategic spatial vision including rigorous greening and ecological considerations."
    }
  ],
  "nodes": [
    {
      "id": "a_college",
      "label": "College & Council",
      "type": "actor",
      "group": "governance",
      "summary": "Sets city-wide strategic direction, adopts policy and allocates political/administrative priorities affecting urban trees.",
      "why": "Represents the political-governance layer above operational tree management.",
      "lenses": [
        "governance",
        "policy"
      ],
      "sources": [
        "S10",
        "S17"
      ],
      "confidence": "high"
    },
    {
      "id": "a_vor",
      "label": "V&OR",
      "type": "actor",
      "group": "governance",
      "summary": "Verkeer & Openbare Ruimte: policy/asset-management actor linked to public-space standards and the municipal tree dataset.",
      "why": "Important bridge between policy, public-space design and asset information.",
      "lenses": [
        "governance",
        "information",
        "lifecycle",
        "policy"
      ],
      "sources": [
        "S3",
        "S13"
      ],
      "confidence": "high",
      "translation": "Traffic & Public Space (Verkeer & Openbare Ruimte)"
    },
    {
      "id": "a_stadswerken",
      "label": "Stadswerken / GFF",
      "type": "actor",
      "group": "operations",
      "summary": "Operational public-space management. Groen, Flora en Fauna is responsible for daily maintenance of parks and tree/green assets.",
      "why": "Core operational manager of public greenery.",
      "lenses": [
        "governance",
        "lifecycle",
        "operations",
        "participation"
      ],
      "sources": [
        "S11",
        "S13"
      ],
      "confidence": "high",
      "translation": "Municipal Works / Green, Flora & Fauna"
    },
    {
      "id": "a_teambomen",
      "label": "Team Bomen",
      "type": "actor",
      "group": "operations",
      "summary": "Specialist tree team working with tree contracts, inspections, felling/replanting procedures and emergency services.",
      "why": "Represents specialist arboricultural expertise inside the municipal management system.",
      "lenses": [
        "governance",
        "lifecycle",
        "operations",
        "information"
      ],
      "sources": [
        "S12"
      ],
      "confidence": "high",
      "translation": "Tree Team"
    },
    {
      "id": "a_ecologists",
      "label": "City ecologists",
      "type": "actor",
      "group": "knowledge",
      "summary": "Ecological specialists who advise projects on biodiversity and ecological design choices.",
      "why": "Connects biodiversity knowledge to public-space projects and tree decisions.",
      "lenses": [
        "governance",
        "ecology",
        "policy",
        "lifecycle"
      ],
      "sources": [
        "S6",
        "S7"
      ],
      "confidence": "high"
    },
    {
      "id": "a_districts",
      "label": "District boards / permits",
      "type": "actor",
      "group": "governance",
      "summary": "District governance and permit functions participate in decisions on tree-management plans and felling permissions.",
      "why": "Represents the decentralized administrative decision layer.",
      "lenses": [
        "governance",
        "permits",
        "participation"
      ],
      "sources": [
        "S9",
        "S13",
        "S15"
      ],
      "confidence": "medium"
    },
    {
      "id": "a_projects",
      "label": "Public-space project teams",
      "type": "actor",
      "group": "projects",
      "summary": "Teams responsible for redesign, infrastructure renewal and other projects that can affect existing trees.",
      "why": "Major source of tree-management decisions outside routine maintenance.",
      "lenses": [
        "governance",
        "lifecycle",
        "projects"
      ],
      "sources": [
        "S10",
        "S14"
      ],
      "confidence": "high"
    },
    {
      "id": "a_contractors",
      "label": "Tree contractors",
      "type": "actor",
      "group": "operations",
      "summary": "External contractors carry out parts of establishment care and specialist tree work under municipal contracts.",
      "why": "Key implementation actor between municipal instructions and physical tree care.",
      "lenses": [
        "lifecycle",
        "operations",
        "governance"
      ],
      "sources": [
        "S4",
        "S12"
      ],
      "confidence": "high"
    },
    {
      "id": "a_residents",
      "label": "Residents & local groups",
      "type": "actor",
      "group": "public",
      "summary": "Observe trees, submit public-space reports, participate in selected planning processes and can object to felling permits.",
      "why": "The principal public interface to the formal tree-management system.",
      "lenses": [
        "participation",
        "information",
        "permits",
        "governance"
      ],
      "sources": [
        "S1",
        "S2",
        "S9",
        "S13"
      ],
      "confidence": "high"
    },
    {
      "id": "a_nurseries",
      "label": "Tree nurseries",
      "type": "actor",
      "group": "supply",
      "summary": "Supply planting stock selected for Amsterdam projects.",
      "why": "Upstream actor in the physical tree lifecycle.",
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "sources": [
        "S4"
      ],
      "confidence": "high"
    },
    {
      "id": "r_vision",
      "label": "Green / Spatial vision",
      "type": "rule",
      "group": "policy",
      "summary": "Long-term city goals for greening, liveability, ecological connectivity and public space.",
      "why": "Provides strategic intent rather than an individual operational instruction.",
      "lenses": [
        "policy",
        "governance",
        "ecology"
      ],
      "sources": [
        "S7",
        "S17"
      ],
      "confidence": "high"
    },
    {
      "id": "r_puccini",
      "label": "Puccini + Handboek Groen",
      "type": "rule",
      "group": "policy",
      "summary": "Design and technical standards for Amsterdam public space, including trees, planting conditions and biodiversity principles.",
      "why": "Translates strategic goals into design constraints and repeatable technical choices.",
      "lenses": [
        "policy",
        "lifecycle",
        "projects",
        "ecology"
      ],
      "sources": [
        "S5",
        "S6"
      ],
      "confidence": "high",
      "translation": "Puccini Method + Green Handbook"
    },
    {
      "id": "r_bomenverord",
      "label": "Bomenverordening 2024",
      "type": "rule",
      "group": "legal",
      "summary": "Legal framework governing protected tree stock, felling and associated obligations.",
      "why": "Formal legal constraint on removal, major pruning and replacement.",
      "lenses": [
        "policy",
        "governance",
        "permits",
        "lifecycle"
      ],
      "sources": [
        "S8",
        "S9"
      ],
      "confidence": "high",
      "translation": "Tree Ordinance 2024"
    },
    {
      "id": "r_biodiv",
      "label": "Biodiversity policy / plans",
      "type": "rule",
      "group": "policy",
      "summary": "Policy direction for ecological management, connected habitats and biodiversity-sensitive green-space decisions.",
      "why": "Introduces ecological objectives that extend beyond safety and asset condition.",
      "lenses": [
        "policy",
        "ecology",
        "governance"
      ],
      "sources": [
        "S7",
        "S13"
      ],
      "confidence": "high"
    },
    {
      "id": "p_strategy",
      "label": "Translate policy to management",
      "type": "process",
      "group": "governance",
      "summary": "Converts strategic political and ecological goals into management standards, programmes and operational priorities.",
      "why": "Abstract synthesis node used to connect policy documents to implementation.",
      "lenses": [
        "policy",
        "governance",
        "ecology"
      ],
      "sources": [
        "S5",
        "S7",
        "S10",
        "S17"
      ],
      "confidence": "medium"
    },
    {
      "id": "p_project",
      "label": "Plan public-space project",
      "type": "process",
      "group": "projects",
      "summary": "Design or redesign streets, squares, quays and other public spaces where existing or future trees are part of the project.",
      "why": "Project route can create opportunities for new planting or pressures on existing trees.",
      "lenses": [
        "projects",
        "lifecycle",
        "governance",
        "ecology"
      ],
      "sources": [
        "S6",
        "S10",
        "S14"
      ],
      "confidence": "high"
    },
    {
      "id": "p_bea",
      "label": "Tree Effect Analysis (BEA)",
      "type": "process",
      "group": "knowledge",
      "summary": "Assesses tree condition/value and the effects of proposed works, supporting retention, transplanting or removal decisions.",
      "why": "Structured interface between infrastructure projects and tree expertise.",
      "lenses": [
        "projects",
        "lifecycle",
        "information",
        "governance"
      ],
      "sources": [
        "S14"
      ],
      "confidence": "high",
      "translation": "BEA = Boom Effect Analyse / Tree Effect Analysis"
    },
    {
      "id": "p_site",
      "label": "Select species & design site",
      "type": "process",
      "group": "design",
      "summary": "Selects tree/species and designs the growing place within public-space standards and site constraints.",
      "why": "Critical upstream determinant of long-term tree condition and ecological value.",
      "lenses": [
        "lifecycle",
        "projects",
        "ecology"
      ],
      "sources": [
        "S4",
        "S5",
        "S6"
      ],
      "confidence": "high"
    },
    {
      "id": "p_plant",
      "label": "Plant tree",
      "type": "process",
      "group": "operations",
      "summary": "Physical installation of the selected tree in its prepared growing place.",
      "why": "Transition from project/design system into the managed tree asset lifecycle.",
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "sources": [
        "S4"
      ],
      "confidence": "high"
    },
    {
      "id": "p_establish",
      "label": "Establishment care (0-4 yrs)",
      "type": "process",
      "group": "operations",
      "summary": "Early-life care of newly planted trees; Amsterdam states that a contractor provides care during the first four years.",
      "why": "Distinct responsibility phase before routine municipal management.",
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "sources": [
        "S4"
      ],
      "confidence": "high"
    },
    {
      "id": "p_inspect",
      "label": "Routine inspection",
      "type": "process",
      "group": "monitoring",
      "summary": "Periodic inspection for condition, disease and safety; results become part of the tree-management information system.",
      "why": "Main monitoring loop that turns physical tree state into actionable information.",
      "lenses": [
        "lifecycle",
        "information",
        "operations"
      ],
      "sources": [
        "S1",
        "S2",
        "S12"
      ],
      "confidence": "high"
    },
    {
      "id": "p_report",
      "label": "Handle citizen report",
      "type": "process",
      "group": "participation",
      "summary": "Receives and evaluates a resident report or question about a specific public tree.",
      "why": "Alternative observation pathway into the management system.",
      "lenses": [
        "participation",
        "information",
        "operations"
      ],
      "sources": [
        "S1",
        "S2"
      ],
      "confidence": "high"
    },
    {
      "id": "p_assess",
      "label": "Assess condition & options",
      "type": "process",
      "group": "knowledge",
      "summary": "Interprets inspection, project and ecological information to identify maintenance, retention, transplanting or removal options.",
      "why": "Decision-preparation stage where multiple information streams converge.",
      "lenses": [
        "lifecycle",
        "information",
        "governance",
        "ecology"
      ],
      "sources": [
        "S10",
        "S12",
        "S14"
      ],
      "confidence": "medium"
    },
    {
      "id": "p_maintain",
      "label": "Prune / maintain / improve site",
      "type": "process",
      "group": "operations",
      "summary": "Routine or corrective care intended to maintain safety, condition and growing conditions.",
      "why": "Primary non-removal intervention in the lifecycle.",
      "lenses": [
        "lifecycle",
        "operations",
        "ecology"
      ],
      "sources": [
        "S1",
        "S10",
        "S12"
      ],
      "confidence": "high"
    },
    {
      "id": "p_decide",
      "label": "Management decision",
      "type": "process",
      "group": "governance",
      "summary": "Selects a course of action: retain, maintain, improve growing place, transplant, fell, replace or escalate into a permit/project route.",
      "why": "Abstract decision node where technical, ecological, legal and project considerations meet.",
      "lenses": [
        "lifecycle",
        "governance",
        "information",
        "permits"
      ],
      "sources": [
        "S9",
        "S10",
        "S12",
        "S14"
      ],
      "confidence": "medium"
    },
    {
      "id": "p_permit",
      "label": "Felling / pruning permit process",
      "type": "process",
      "group": "legal",
      "summary": "Formal omgevingsvergunning route for qualifying felling, major pruning or transplanting, including publication and objection periods.",
      "why": "Legal authorization layer between decision and many major interventions.",
      "lenses": [
        "permits",
        "governance",
        "lifecycle",
        "participation"
      ],
      "sources": [
        "S8",
        "S9",
        "S10"
      ],
      "confidence": "high"
    },
    {
      "id": "p_intervene",
      "label": "Fell / transplant / emergency work",
      "type": "process",
      "group": "operations",
      "summary": "Physical major intervention, including felling, transplanting or urgent safety/disease response.",
      "why": "High-impact branch of the tree lifecycle.",
      "lenses": [
        "lifecycle",
        "operations",
        "permits"
      ],
      "sources": [
        "S1",
        "S9",
        "S10",
        "S12"
      ],
      "confidence": "high"
    },
    {
      "id": "p_replant",
      "label": "Replant / compensate",
      "type": "process",
      "group": "operations",
      "summary": "Replacement planting or financial compensation via the municipal replacement mechanism when applicable.",
      "why": "Closes the formal replacement loop after felling.",
      "lenses": [
        "lifecycle",
        "operations",
        "permits",
        "governance"
      ],
      "sources": [
        "S1",
        "S9",
        "S10",
        "S15"
      ],
      "confidence": "high"
    },
    {
      "id": "p_biodivmonitor",
      "label": "Monitor green outcomes",
      "type": "process",
      "group": "monitoring",
      "summary": "City-level monitoring of green outcomes such as canopy cover, alongside ecological monitoring and programme evaluation.",
      "why": "Connects tree management back to wider ecological and policy outcomes.",
      "lenses": [
        "ecology",
        "information",
        "policy"
      ],
      "sources": [
        "S16",
        "S7"
      ],
      "confidence": "medium"
    },
    {
      "id": "d_treeasset",
      "label": "Tree passport / GISIB record",
      "type": "data",
      "group": "information",
      "summary": "Structured record for a managed tree; published through the Bomenkaart and underlying municipal data services.",
      "why": "Persistent digital representation linking tree identity, condition and management history.",
      "lenses": [
        "information",
        "lifecycle",
        "participation"
      ],
      "sources": [
        "S2",
        "S3"
      ],
      "confidence": "high"
    },
    {
      "id": "d_inspection",
      "label": "Inspection record",
      "type": "data",
      "group": "information",
      "summary": "Recorded result of tree-safety/condition inspection.",
      "why": "Evidence object used in management decisions and asset history.",
      "lenses": [
        "information",
        "lifecycle"
      ],
      "sources": [
        "S2"
      ],
      "confidence": "high"
    },
    {
      "id": "d_task",
      "label": "Maintenance task",
      "type": "data",
      "group": "information",
      "summary": "Operational work item associated with managed trees.",
      "why": "Links assessment and planning to field execution.",
      "lenses": [
        "information",
        "lifecycle",
        "operations"
      ],
      "sources": [
        "S2"
      ],
      "confidence": "high"
    },
    {
      "id": "d_report",
      "label": "Citizen report / question",
      "type": "data",
      "group": "information",
      "summary": "Resident-submitted observation, concern or question about a specific public tree.",
      "why": "Publicly generated information entering the operational system.",
      "lenses": [
        "information",
        "participation"
      ],
      "sources": [
        "S1",
        "S2"
      ],
      "confidence": "high"
    },
    {
      "id": "d_bea",
      "label": "BEA report",
      "type": "data",
      "group": "information",
      "summary": "Tree Effect Analysis output documenting condition, value, project effects and options.",
      "why": "Formal evidence object in project-related tree decisions.",
      "lenses": [
        "information",
        "projects",
        "lifecycle"
      ],
      "sources": [
        "S14"
      ],
      "confidence": "high"
    },
    {
      "id": "d_permit",
      "label": "Permit decision / conditions",
      "type": "data",
      "group": "legal",
      "summary": "Formal decision and any conditions, such as replanting requirements, following the permit process.",
      "why": "Legal object authorizing or restricting major tree intervention.",
      "lenses": [
        "permits",
        "governance",
        "information"
      ],
      "sources": [
        "S8",
        "S9"
      ],
      "confidence": "high"
    },
    {
      "id": "d_account",
      "label": "Bomenboekhouding",
      "type": "data",
      "group": "accountability",
      "summary": "Public accounting of tree-felling permit activity and replacement planting.",
      "why": "Transparency / accountability output across the permit and replanting system.",
      "lenses": [
        "information",
        "permits",
        "governance"
      ],
      "sources": [
        "S15"
      ],
      "confidence": "high",
      "translation": "Tree accounting / tree ledger"
    },
    {
      "id": "e_trees",
      "label": "Managed public tree stock",
      "type": "ecology",
      "group": "ecology",
      "summary": "The physical stock of roughly 300,000 municipal-managed public trees that the management system acts upon.",
      "why": "The central physical object around which the governance network is organized.",
      "lenses": [
        "lifecycle",
        "ecology",
        "information",
        "governance"
      ],
      "sources": [
        "S1",
        "S2",
        "S10"
      ],
      "confidence": "high"
    },
    {
      "id": "e_outcomes",
      "label": "Biodiversity & ecosystem services",
      "type": "ecology",
      "group": "ecology",
      "summary": "Habitat, ecological connectivity, shade/cooling, water regulation and other public/ecological values produced by healthy urban trees.",
      "why": "Represents outcomes that tree management is intended to protect or increase.",
      "lenses": [
        "ecology",
        "policy",
        "lifecycle"
      ],
      "sources": [
        "S7",
        "S10",
        "S16"
      ],
      "confidence": "high"
    }
  ],
  "edges": [
    {
      "id": "e1",
      "source": "a_college",
      "target": "r_vision",
      "label": "sets strategic direction",
      "group": "authority",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S10",
        "S17"
      ],
      "lenses": [
        "policy",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e2",
      "source": "r_vision",
      "target": "p_strategy",
      "label": "guides",
      "group": "authority",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S7",
        "S17"
      ],
      "lenses": [
        "policy",
        "governance",
        "ecology"
      ],
      "evidence": ""
    },
    {
      "id": "e3",
      "source": "r_biodiv",
      "target": "p_strategy",
      "label": "guides ecological priorities",
      "group": "authority",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S7",
        "S13"
      ],
      "lenses": [
        "policy",
        "governance",
        "ecology"
      ],
      "evidence": ""
    },
    {
      "id": "e4",
      "source": "p_strategy",
      "target": "a_vor",
      "label": "implemented through",
      "group": "authority",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S5",
        "S13"
      ],
      "lenses": [
        "policy",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e5",
      "source": "p_strategy",
      "target": "a_stadswerken",
      "label": "implemented through",
      "group": "authority",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S11",
        "S13"
      ],
      "lenses": [
        "policy",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e6",
      "source": "a_vor",
      "target": "r_puccini",
      "label": "maintains / applies standards",
      "group": "authority",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S3",
        "S5"
      ],
      "lenses": [
        "policy",
        "governance",
        "projects"
      ],
      "evidence": ""
    },
    {
      "id": "e7",
      "source": "r_puccini",
      "target": "p_site",
      "label": "constrains design",
      "group": "authority",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S5",
        "S6"
      ],
      "lenses": [
        "policy",
        "lifecycle",
        "projects",
        "ecology"
      ],
      "evidence": ""
    },
    {
      "id": "e8",
      "source": "r_biodiv",
      "target": "p_site",
      "label": "adds ecological criteria",
      "group": "authority",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S6",
        "S7"
      ],
      "lenses": [
        "policy",
        "ecology",
        "lifecycle"
      ],
      "evidence": ""
    },
    {
      "id": "e9",
      "source": "a_ecologists",
      "target": "p_project",
      "label": "advises",
      "group": "participation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S6"
      ],
      "lenses": [
        "projects",
        "ecology",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e10",
      "source": "a_projects",
      "target": "p_project",
      "label": "leads",
      "group": "participation",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S14"
      ],
      "lenses": [
        "projects",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e11",
      "source": "p_project",
      "target": "p_bea",
      "label": "triggers when trees affected",
      "group": "operation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S14"
      ],
      "lenses": [
        "projects",
        "lifecycle"
      ],
      "evidence": ""
    },
    {
      "id": "e12",
      "source": "p_bea",
      "target": "d_bea",
      "label": "produces",
      "group": "information",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S14"
      ],
      "lenses": [
        "projects",
        "information",
        "lifecycle"
      ],
      "evidence": ""
    },
    {
      "id": "e13",
      "source": "d_bea",
      "target": "p_assess",
      "label": "informs",
      "group": "information",
      "basis": "synthesis",
      "confidence": "high",
      "sources": [
        "S14"
      ],
      "lenses": [
        "projects",
        "information",
        "lifecycle"
      ],
      "evidence": ""
    },
    {
      "id": "e14",
      "source": "p_project",
      "target": "p_site",
      "label": "creates / changes planting design",
      "group": "operation",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S5",
        "S6"
      ],
      "lenses": [
        "projects",
        "lifecycle",
        "ecology"
      ],
      "evidence": ""
    },
    {
      "id": "e15",
      "source": "a_nurseries",
      "target": "p_plant",
      "label": "supplies planting stock",
      "group": "resource",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S4"
      ],
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e16",
      "source": "p_site",
      "target": "p_plant",
      "label": "specifies",
      "group": "operation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S4",
        "S5"
      ],
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e17",
      "source": "p_plant",
      "target": "e_trees",
      "label": "adds tree",
      "group": "operation",
      "basis": "synthesis",
      "confidence": "high",
      "sources": [
        "S4"
      ],
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e18",
      "source": "a_contractors",
      "target": "p_establish",
      "label": "performs",
      "group": "participation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S4"
      ],
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e19",
      "source": "p_plant",
      "target": "p_establish",
      "label": "starts establishment phase",
      "group": "operation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S4"
      ],
      "lenses": [
        "lifecycle"
      ],
      "evidence": ""
    },
    {
      "id": "e20",
      "source": "p_establish",
      "target": "e_trees",
      "label": "supports establishment",
      "group": "operation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S4"
      ],
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e21",
      "source": "a_stadswerken",
      "target": "p_maintain",
      "label": "responsible for daily green maintenance",
      "group": "participation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S11"
      ],
      "lenses": [
        "lifecycle",
        "operations",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e22",
      "source": "a_teambomen",
      "target": "p_inspect",
      "label": "specialist role",
      "group": "participation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S12"
      ],
      "lenses": [
        "lifecycle",
        "information",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e23",
      "source": "e_trees",
      "target": "p_inspect",
      "label": "is observed by",
      "group": "information",
      "basis": "synthesis",
      "confidence": "high",
      "sources": [
        "S1",
        "S2"
      ],
      "lenses": [
        "lifecycle",
        "information"
      ],
      "evidence": ""
    },
    {
      "id": "e24",
      "source": "p_inspect",
      "target": "d_inspection",
      "label": "produces",
      "group": "information",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S2"
      ],
      "lenses": [
        "lifecycle",
        "information"
      ],
      "evidence": ""
    },
    {
      "id": "e25",
      "source": "d_inspection",
      "target": "d_treeasset",
      "label": "recorded in",
      "group": "information",
      "basis": "synthesis",
      "confidence": "high",
      "sources": [
        "S2",
        "S3"
      ],
      "lenses": [
        "lifecycle",
        "information"
      ],
      "evidence": ""
    },
    {
      "id": "e26",
      "source": "a_vor",
      "target": "d_treeasset",
      "label": "data ownership / stewardship",
      "group": "authority",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S3"
      ],
      "lenses": [
        "information",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e27",
      "source": "d_treeasset",
      "target": "p_assess",
      "label": "informs",
      "group": "information",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S2",
        "S3"
      ],
      "lenses": [
        "information",
        "lifecycle"
      ],
      "evidence": ""
    },
    {
      "id": "e28",
      "source": "a_residents",
      "target": "d_treeasset",
      "label": "views tree passport",
      "group": "information",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S1",
        "S2"
      ],
      "lenses": [
        "participation",
        "information"
      ],
      "evidence": ""
    },
    {
      "id": "e29",
      "source": "a_residents",
      "target": "d_report",
      "label": "submits",
      "group": "participation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S1",
        "S2"
      ],
      "lenses": [
        "participation",
        "information"
      ],
      "evidence": ""
    },
    {
      "id": "e30",
      "source": "d_report",
      "target": "p_report",
      "label": "enters",
      "group": "information",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S1",
        "S2"
      ],
      "lenses": [
        "participation",
        "information"
      ],
      "evidence": ""
    },
    {
      "id": "e31",
      "source": "p_report",
      "target": "p_inspect",
      "label": "can trigger field check",
      "group": "information",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S1",
        "S2"
      ],
      "lenses": [
        "participation",
        "information",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e32",
      "source": "p_report",
      "target": "p_assess",
      "label": "can inform",
      "group": "information",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S1",
        "S2"
      ],
      "lenses": [
        "participation",
        "information"
      ],
      "evidence": ""
    },
    {
      "id": "e33",
      "source": "p_assess",
      "target": "p_decide",
      "label": "supports",
      "group": "information",
      "basis": "synthesis",
      "confidence": "high",
      "sources": [
        "S10",
        "S12",
        "S14"
      ],
      "lenses": [
        "lifecycle",
        "information",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e34",
      "source": "p_decide",
      "target": "d_task",
      "label": "creates maintenance work",
      "group": "information",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S2"
      ],
      "lenses": [
        "lifecycle",
        "information",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e35",
      "source": "d_task",
      "target": "p_maintain",
      "label": "authorizes / schedules",
      "group": "operation",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S2"
      ],
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e36",
      "source": "a_contractors",
      "target": "p_maintain",
      "label": "may execute contracted work",
      "group": "participation",
      "basis": "documented",
      "confidence": "medium",
      "sources": [
        "S12"
      ],
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e37",
      "source": "p_maintain",
      "target": "e_trees",
      "label": "changes condition",
      "group": "operation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S1",
        "S10"
      ],
      "lenses": [
        "lifecycle",
        "operations",
        "ecology"
      ],
      "evidence": ""
    },
    {
      "id": "e38",
      "source": "p_decide",
      "target": "p_permit",
      "label": "escalates major intervention",
      "group": "authority",
      "basis": "synthesis",
      "confidence": "high",
      "sources": [
        "S8",
        "S9",
        "S10"
      ],
      "lenses": [
        "lifecycle",
        "permits",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e39",
      "source": "r_bomenverord",
      "target": "p_permit",
      "label": "governs",
      "group": "authority",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S8",
        "S9"
      ],
      "lenses": [
        "permits",
        "governance",
        "policy"
      ],
      "evidence": ""
    },
    {
      "id": "e40",
      "source": "a_districts",
      "target": "p_permit",
      "label": "administers / decides",
      "group": "participation",
      "basis": "documented",
      "confidence": "medium",
      "sources": [
        "S9",
        "S15"
      ],
      "lenses": [
        "permits",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e41",
      "source": "p_permit",
      "target": "d_permit",
      "label": "produces",
      "group": "information",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S9"
      ],
      "lenses": [
        "permits",
        "information",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e42",
      "source": "a_residents",
      "target": "p_permit",
      "label": "can object / participate",
      "group": "participation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S1",
        "S9"
      ],
      "lenses": [
        "permits",
        "participation",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e43",
      "source": "d_permit",
      "target": "p_intervene",
      "label": "authorizes / conditions",
      "group": "authority",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S9"
      ],
      "lenses": [
        "permits",
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e44",
      "source": "a_teambomen",
      "target": "p_intervene",
      "label": "specialist procedures / emergency",
      "group": "participation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S12"
      ],
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e45",
      "source": "a_contractors",
      "target": "p_intervene",
      "label": "may execute",
      "group": "participation",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S12"
      ],
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e46",
      "source": "p_intervene",
      "target": "e_trees",
      "label": "removes / transplants / makes safe",
      "group": "operation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S1",
        "S9",
        "S10"
      ],
      "lenses": [
        "lifecycle",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e47",
      "source": "d_permit",
      "target": "p_replant",
      "label": "can require",
      "group": "authority",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S9",
        "S10"
      ],
      "lenses": [
        "permits",
        "lifecycle"
      ],
      "evidence": ""
    },
    {
      "id": "e48",
      "source": "p_intervene",
      "target": "p_replant",
      "label": "creates replacement obligation",
      "group": "operation",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S1",
        "S9",
        "S10"
      ],
      "lenses": [
        "lifecycle",
        "permits"
      ],
      "evidence": ""
    },
    {
      "id": "e49",
      "source": "p_replant",
      "target": "p_site",
      "label": "feeds new planting cycle",
      "group": "operation",
      "basis": "synthesis",
      "confidence": "high",
      "sources": [
        "S1",
        "S9"
      ],
      "lenses": [
        "lifecycle"
      ],
      "evidence": ""
    },
    {
      "id": "e50",
      "source": "p_permit",
      "target": "d_account",
      "label": "aggregated into",
      "group": "information",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S15"
      ],
      "lenses": [
        "permits",
        "information",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e51",
      "source": "p_replant",
      "target": "d_account",
      "label": "replacement recorded in",
      "group": "information",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S15"
      ],
      "lenses": [
        "permits",
        "information",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e52",
      "source": "e_trees",
      "target": "e_outcomes",
      "label": "provides",
      "group": "ecology",
      "basis": "documented",
      "confidence": "high",
      "sources": [
        "S7",
        "S10",
        "S16"
      ],
      "lenses": [
        "ecology",
        "lifecycle",
        "policy"
      ],
      "evidence": ""
    },
    {
      "id": "e53",
      "source": "r_biodiv",
      "target": "p_biodivmonitor",
      "label": "sets outcomes to track",
      "group": "authority",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S7",
        "S16"
      ],
      "lenses": [
        "ecology",
        "policy",
        "information"
      ],
      "evidence": ""
    },
    {
      "id": "e54",
      "source": "e_trees",
      "target": "p_biodivmonitor",
      "label": "measured at stock / city level",
      "group": "information",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S16"
      ],
      "lenses": [
        "ecology",
        "information"
      ],
      "evidence": ""
    },
    {
      "id": "e55",
      "source": "p_biodivmonitor",
      "target": "p_strategy",
      "label": "feeds evaluation",
      "group": "information",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S7",
        "S16"
      ],
      "lenses": [
        "ecology",
        "policy",
        "information"
      ],
      "evidence": ""
    },
    {
      "id": "e56",
      "source": "a_residents",
      "target": "p_project",
      "label": "participates in selected redesigns",
      "group": "participation",
      "basis": "documented",
      "confidence": "medium",
      "sources": [
        "S6",
        "S13"
      ],
      "lenses": [
        "participation",
        "projects",
        "governance"
      ],
      "evidence": ""
    },
    {
      "id": "e57",
      "source": "a_districts",
      "target": "p_strategy",
      "label": "adopts local management plans",
      "group": "authority",
      "basis": "documented",
      "confidence": "medium",
      "sources": [
        "S13"
      ],
      "lenses": [
        "governance",
        "policy"
      ],
      "evidence": ""
    },
    {
      "id": "e58",
      "source": "a_stadswerken",
      "target": "p_report",
      "label": "receives operational signals",
      "group": "participation",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S11",
        "S13"
      ],
      "lenses": [
        "participation",
        "information",
        "operations"
      ],
      "evidence": ""
    },
    {
      "id": "e59",
      "source": "p_assess",
      "target": "e_outcomes",
      "label": "considers ecological/public value",
      "group": "ecology",
      "basis": "synthesis",
      "confidence": "medium",
      "sources": [
        "S6",
        "S7",
        "S10"
      ],
      "lenses": [
        "ecology",
        "lifecycle",
        "governance"
      ],
      "evidence": ""
    }
  ]
};
