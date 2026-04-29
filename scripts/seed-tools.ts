import "./load-env";

import { createClient } from "@supabase/supabase-js";

type ToolSeed = {
  name: string;
  homepage_url: string;
  category: string;
  pricing: "Free" | "Freemium" | "Paid" | "Research" | "Unknown";
  summary_cs: string;
  use_case_cs: string;
  signal_score: number;
  updated_at: string;
};

const checkedAt = new Date().toISOString();

const tools: ToolSeed[] = [
  {
    name: "ChatGPT",
    homepage_url: "https://chatgpt.com/",
    category: "Obecny asistent",
    pricing: "Freemium",
    summary_cs: "Univerzalni AI asistent pro psani, analyzu, brainstorming, praci se soubory a obrazem.",
    use_case_cs: "Rychle vysvetleni tematu, priprava textu, analyza dokumentu a prototypovani napadu.",
    signal_score: 94,
    updated_at: checkedAt,
  },
  {
    name: "Claude",
    homepage_url: "https://claude.ai/",
    category: "Obecny asistent",
    pricing: "Freemium",
    summary_cs: "AI asistent silny v dlouhem kontextu, praci s textem, dokumenty a kodem.",
    use_case_cs: "Analyticke shrnuti delsich materialu, navrh struktury textu a kontrola argumentace.",
    signal_score: 93,
    updated_at: checkedAt,
  },
  {
    name: "Google Gemini",
    homepage_url: "https://gemini.google.com/",
    category: "Obecny asistent",
    pricing: "Freemium",
    summary_cs: "AI asistent napojeny na ekosystem Google a multimodalni praci s textem, obrazem a daty.",
    use_case_cs: "Vyhledavani souvislosti, priprava podkladu a prace s dokumenty v prostredi Google.",
    signal_score: 89,
    updated_at: checkedAt,
  },
  {
    name: "Microsoft Copilot",
    homepage_url: "https://copilot.microsoft.com/",
    category: "Produktivita",
    pricing: "Freemium",
    summary_cs: "AI asistent pro beznou kancelarskou praci a ekosystem Microsoftu.",
    use_case_cs: "Shrnuti textu, priprava e-mailu, rychle odpovedi a prace s kancelarskymi dokumenty.",
    signal_score: 84,
    updated_at: checkedAt,
  },
  {
    name: "Perplexity",
    homepage_url: "https://www.perplexity.ai/",
    category: "Vyzkum a zdroje",
    pricing: "Freemium",
    summary_cs: "AI vyhledavani se zdroji a rychlou syntetickou odpovedi.",
    use_case_cs: "Rychla orientace v tematu pred ctenim primarnich zdroju a clanku.",
    signal_score: 88,
    updated_at: checkedAt,
  },
  {
    name: "NotebookLM",
    homepage_url: "https://notebooklm.google/",
    category: "Vyzkum a zdroje",
    pricing: "Freemium",
    summary_cs: "Pracovni prostor nad vlastnimi zdroji, dokumenty, poznamkami a audio prehledy.",
    use_case_cs: "Analyza dlouhych reportu, guideline dokumentu, studijnich materialu a prednasek.",
    signal_score: 87,
    updated_at: checkedAt,
  },
  {
    name: "Elicit",
    homepage_url: "https://elicit.com/",
    category: "Vyzkum a zdroje",
    pricing: "Freemium",
    summary_cs: "Nastroj pro vyhledavani a strukturovane zpracovani vedecke literatury.",
    use_case_cs: "Rychle mapovani literatury, extrakce tvrzeni a priprava research briefu.",
    signal_score: 84,
    updated_at: checkedAt,
  },
  {
    name: "Consensus",
    homepage_url: "https://consensus.app/",
    category: "Vyzkum a zdroje",
    pricing: "Freemium",
    summary_cs: "Vyhledavani odpovedi ve vedeckych publikacich s durazem na citovane zdroje.",
    use_case_cs: "Overeni tvrzeni, prvni prehled dukazu a vyhledani relevantnich studiich.",
    signal_score: 82,
    updated_at: checkedAt,
  },
  {
    name: "Semantic Scholar",
    homepage_url: "https://www.semanticscholar.org/",
    category: "Vyzkum a zdroje",
    pricing: "Free",
    summary_cs: "Akademicky vyhledavac s AI funkcemi pro orientaci ve vedeckych pracech.",
    use_case_cs: "Vyhledani souvisejicich praci, autoru, citaci a navazujici literatury.",
    signal_score: 80,
    updated_at: checkedAt,
  },
  {
    name: "Research Rabbit",
    homepage_url: "https://www.researchrabbit.ai/",
    category: "Vyzkum a zdroje",
    pricing: "Free",
    summary_cs: "Vizualni mapovani vedecke literatury, autoru a souvisejicich clanku.",
    use_case_cs: "Objevovani navazujicich publikaci a vytvareni tematickych map vyzkumu.",
    signal_score: 76,
    updated_at: checkedAt,
  },
  {
    name: "OpenEvidence",
    homepage_url: "https://www.openevidence.com/",
    category: "Medicina",
    pricing: "Unknown",
    summary_cs: "Specializovane AI vyhledavani medicinskych dukazu a klinickych odpovedi.",
    use_case_cs: "Rychle mapovani literatury pro klinicke otazky a medicinske vzdelavani.",
    signal_score: 90,
    updated_at: checkedAt,
  },
  {
    name: "Scite",
    homepage_url: "https://scite.ai/",
    category: "Vyzkum a zdroje",
    pricing: "Paid",
    summary_cs: "Analyza citaci a kontextu, zda prace podporuji nebo zpochybnuji vybrane tvrzeni.",
    use_case_cs: "Kontrola kvality literatury, citacni due diligence a priprava review.",
    signal_score: 78,
    updated_at: checkedAt,
  },
  {
    name: "Khanmigo",
    homepage_url: "https://www.khanmigo.ai/",
    category: "Vzdelavani",
    pricing: "Paid",
    summary_cs: "AI tutor a pomocnik pro vyuku postaveny pro vzdelavaci scenare.",
    use_case_cs: "Podpora studentu, navrh otazek, vysvetlovani a priprava vyukovych aktivit.",
    signal_score: 76,
    updated_at: checkedAt,
  },
  {
    name: "MagicSchool",
    homepage_url: "https://www.magicschool.ai/",
    category: "Vzdelavani",
    pricing: "Freemium",
    summary_cs: "Sada AI nastroju pro ucitele, pripravu hodin, rubrik a diferenciaci vyuky.",
    use_case_cs: "Rychla priprava pracovnich listu, hodnoticich kriterii a napadu pro vyuku.",
    signal_score: 75,
    updated_at: checkedAt,
  },
  {
    name: "Cursor",
    homepage_url: "https://www.cursor.com/",
    category: "Vyvoj",
    pricing: "Freemium",
    summary_cs: "AI editor pro programovani s kontextem celeho projektu.",
    use_case_cs: "Rychlejsi implementace, refaktoring, vysvetleni kodu a opravy chyb.",
    signal_score: 88,
    updated_at: checkedAt,
  },
  {
    name: "GitHub Copilot",
    homepage_url: "https://github.com/features/copilot",
    category: "Vyvoj",
    pricing: "Paid",
    summary_cs: "AI asistent pro programovani integrovany do GitHubu a editoru.",
    use_case_cs: "Doplnovani kodu, chat nad repozitarem, testy a rychle vysvetleni zmen.",
    signal_score: 86,
    updated_at: checkedAt,
  },
  {
    name: "Continue",
    homepage_url: "https://www.continue.dev/",
    category: "Vyvoj",
    pricing: "Free",
    summary_cs: "Open-source AI asistent do editoru s moznosti volby modelu.",
    use_case_cs: "Programovani s vlastnimi modely, lokalni workflow a tymova kontrola nastaveni.",
    signal_score: 78,
    updated_at: checkedAt,
  },
  {
    name: "LangSmith",
    homepage_url: "https://www.langchain.com/langsmith",
    category: "Data a evaluace",
    pricing: "Freemium",
    summary_cs: "Tracing, evaluace a monitoring LLM aplikaci a agentu.",
    use_case_cs: "Kontrola kvality automatizovaneho zpracovani novinek, promptu a agentnich kroku.",
    signal_score: 86,
    updated_at: checkedAt,
  },
  {
    name: "Langfuse",
    homepage_url: "https://langfuse.com/",
    category: "Data a evaluace",
    pricing: "Freemium",
    summary_cs: "Open-source observabilita, tracing a metriky pro LLM aplikace.",
    use_case_cs: "Sledovani kvality shrnuti, nakladu, latence a verzi promptu v produkci.",
    signal_score: 84,
    updated_at: checkedAt,
  },
  {
    name: "Weights & Biases Weave",
    homepage_url: "https://wandb.ai/site/weave/",
    category: "Data a evaluace",
    pricing: "Freemium",
    summary_cs: "Nastroj pro evaluace, tracing a iterace AI aplikaci.",
    use_case_cs: "Vyhodnocovani vystupu modelu a sledovani kvality AI pipeline.",
    signal_score: 79,
    updated_at: checkedAt,
  },
  {
    name: "Dify",
    homepage_url: "https://dify.ai/",
    category: "LLM aplikace",
    pricing: "Freemium",
    summary_cs: "Platforma pro stavbu LLM aplikaci, agentu a workflow s vlastnimi daty.",
    use_case_cs: "Rychle prototypovani internich AI aplikaci a znalostnich asistentu.",
    signal_score: 82,
    updated_at: checkedAt,
  },
  {
    name: "Flowise",
    homepage_url: "https://flowiseai.com/",
    category: "LLM aplikace",
    pricing: "Freemium",
    summary_cs: "Visual builder pro LLM workflow, chatflow a integrace nad vlastnimi zdroji.",
    use_case_cs: "Navrh AI procesu bez psani cele aplikace od nuly.",
    signal_score: 75,
    updated_at: checkedAt,
  },
  {
    name: "Hugging Face",
    homepage_url: "https://huggingface.co/",
    category: "Modely a open source",
    pricing: "Freemium",
    summary_cs: "Ekosystem modelu, datasetu, demo prostoru a knihoven pro AI vyvoj.",
    use_case_cs: "Vyhledani modelu, testovani demo aplikaci a prace s open-source AI.",
    signal_score: 88,
    updated_at: checkedAt,
  },
  {
    name: "Gradio",
    homepage_url: "https://www.gradio.app/",
    category: "LLM aplikace",
    pricing: "Free",
    summary_cs: "Framework pro rychle vytvareni webovych demo rozhrani pro ML a AI modely.",
    use_case_cs: "Rychle prototypovani interaktivnich ukazek modelu pro tym nebo vyuku.",
    signal_score: 77,
    updated_at: checkedAt,
  },
  {
    name: "n8n",
    homepage_url: "https://n8n.io/",
    category: "Automatizace",
    pricing: "Freemium",
    summary_cs: "Workflow automatizace s integracemi a AI kroky.",
    use_case_cs: "Napojeni RSS, databaze, notifikaci a AI zpracovani do opakovatelnych procesu.",
    signal_score: 81,
    updated_at: checkedAt,
  },
  {
    name: "Zapier",
    homepage_url: "https://zapier.com/",
    category: "Automatizace",
    pricing: "Freemium",
    summary_cs: "Automatizace mezi aplikacemi s AI funkcemi a agenty.",
    use_case_cs: "Propojovani formularu, e-mailu, databazi, upozorneni a pracovnich toku.",
    signal_score: 76,
    updated_at: checkedAt,
  },
  {
    name: "Gamma",
    homepage_url: "https://gamma.app/",
    category: "Tvorba obsahu",
    pricing: "Freemium",
    summary_cs: "AI tvorba prezentaci, dokumentu a webovych podkladu.",
    use_case_cs: "Rychla priprava prezentace, edukacniho materialu nebo navrhu struktury obsahu.",
    signal_score: 73,
    updated_at: checkedAt,
  },
  {
    name: "Canva Magic Studio",
    homepage_url: "https://www.canva.com/magic/",
    category: "Tvorba obsahu",
    pricing: "Freemium",
    summary_cs: "AI funkce v Canve pro obraz, text, prezentace a marketingove materialy.",
    use_case_cs: "Vizualni priprava edukacnich nebo komunikacnich materialu bez grafickeho tymu.",
    signal_score: 72,
    updated_at: checkedAt,
  },
  {
    name: "ElevenLabs",
    homepage_url: "https://elevenlabs.io/",
    category: "Tvorba obsahu",
    pricing: "Freemium",
    summary_cs: "AI generovani a uprava hlasu, dabingu a audio obsahu.",
    use_case_cs: "Tvorba audio verzi shrnuti, vyukovych materialu nebo komentaru k obsahu.",
    signal_score: 74,
    updated_at: checkedAt,
  },
  {
    name: "Descript",
    homepage_url: "https://www.descript.com/",
    category: "Tvorba obsahu",
    pricing: "Freemium",
    summary_cs: "AI editace audia a videa s textovym workflow.",
    use_case_cs: "Strih podcastu, kratkych edukacnich videi a prepisu rozhovoru.",
    signal_score: 70,
    updated_at: checkedAt,
  },
];

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});

async function main() {
  const { error } = await supabase.from("tools").upsert(tools, {
    onConflict: "homepage_url",
  });

  if (error) {
    throw new Error(`Failed to seed tools: ${error.message}`);
  }

  console.log(`Seeded ${tools.length} tools.`);
}

void main();
