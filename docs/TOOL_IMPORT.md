# Import AI nastroju z CSV

Signalmind umi importovat externi seznamy AI nastroju pres CSV a ukladat je do
tabulky `tools` v Supabase. Import dela upsert podle `homepage_url`, takze pri
opakovani nevzniknou duplicity.

## Postup pro Airtable

1. Otevri sdileny Airtable seznam.
2. V menu view vyber `Download CSV`, pokud je export povoleny.
3. Soubor uloz treba jako `exports/superhuman-tools.csv`.
4. Nejdriv zkus suchy beh:

```bash
npm run tools:import-csv -- --file=./exports/superhuman-tools.csv --dry-run
```

5. Pokud mapovani sloupcu vypada dobre, spust import:

```bash
npm run tools:import-csv -- --file=./exports/superhuman-tools.csv
```

## Podporovane sloupce

Skript automaticky rozpozna bezne nazvy sloupcu:

- nazev: `name`, `tool`, `tool name`, `product`, `app`, `title`
- odkaz: `url`, `link`, `website`, `homepage`, `tool url`
- kategorie: `category`, `type`, `segment`, `use case`
- cena: `pricing`, `price`, `cost`, `plan`
- popis: `description`, `summary`, `overview`, `tagline`
- pouziti: `use case`, `best for`, `workflow`
- relevance: `score`, `rating`, `rank`, `ranking`

Volitelne parametry:

```bash
npm run tools:import-csv -- --file=./exports/tools.csv --limit=50
npm run tools:import-csv -- --file=./exports/tools.csv --default-score=70
```

Pokud CSV neobsahuje popis nebo use-case, skript doplni neutralni cesky text,
ktery je mozne pozdeji upravit nebo obohatit AI zpracovanim.

## Import VUT katalogu rizik

VUT verejne publikuje katalog AI nastroju s rizikovou klasifikaci, stavem vuci
EU/CR pozadavkum, doporucenym rozhodnutim a podminkami pouziti.

Nejdriv je potreba v Supabase SQL editoru spustit migraci:

```sql
-- supabase/migrations/0005_tool_risk_fields.sql
```

Potom je mozne import overit:

```bash
npm run tools:import-vut -- --dry-run
```

A spustit ostry import:

```bash
npm run tools:import-vut
```

Volitelne je mozne import omezit:

```bash
npm run tools:import-vut -- --limit=25
```

Import dela upsert podle `homepage_url`. Kdyz uz v katalogu existuje nastroj se
stejnym nazvem, importer se pokusi pouzit jeho existujici URL a doplnit k nemu
rizikova metadata, aby nevznikaly zbytecne duplicity.
