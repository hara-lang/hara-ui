// @ts-check

/** @typedef {"required" | "optional" | "deprecated"} FieldRequirement */
/** @typedef {"author" | "derived" | "identity" | "registry" | "source" | "reviewer" | "runtime"} FieldControl */

/**
 * @typedef {object} ContentField
 * @property {string} id
 * @property {string} label
 * @property {string} type
 * @property {FieldRequirement} requirement
 * @property {FieldControl} control
 * @property {string} source
 * @property {string} description
 * @property {string=} defaultValue
 * @property {string[]=} derivedFrom
 * @property {boolean=} registryOwned
 * @property {string=} replacement
 */

/**
 * @typedef {object} ContentType
 * @property {string} id
 * @property {string} label
 * @property {string} version
 * @property {string} summary
 * @property {string[]} required
 * @property {string[]} optional
 */

/**
 * @typedef {object} ContentContract
 * @property {string} id
 * @property {string} label
 * @property {number} issue
 * @property {string} route
 * @property {string} summary
 * @property {string} schemaNamespace
 * @property {string} schemaVersion
 * @property {string[]} publicationPaths
 * @property {string} registryOwner
 * @property {ContentField[]} fields
 * @property {ContentType[]} types
 */

/**
 * @typedef {object} ContentSpecimen
 * @property {string} id
 * @property {string} label
 * @property {"valid" | "invalid" | "migrated" | "imported"} state
 * @property {string} contentType
 * @property {string} schemaVersion
 * @property {Record<string, unknown>} author
 * @property {Record<string, unknown>} controlled
 * @property {Record<string, unknown>} derived
 * @property {Record<string, unknown>=} provenance
 * @property {Record<string, unknown>=} migration
 */

/**
 * @typedef {object} ValidationMessage
 * @property {"error" | "warning" | "notice"} level
 * @property {string} code
 * @property {string} field
 * @property {string} message
 */

export const controlLabels = {
  author: "Browser editable",
  derived: "Generated from named inputs",
  identity: "Identity service controlled",
  registry: "Registry controlled",
  source: "Source registry controlled",
  reviewer: "Reviewer controlled",
  runtime: "Runtime controlled"
};

export const lifecycleStates = [
  {
    id: "draft",
    label: "Draft",
    actor: "Author",
    durability: "Local or account-scoped",
    summary: "Editable content has no public identity and may be discarded."
  },
  {
    id: "proposed",
    label: "Proposed",
    actor: "Author + registry",
    durability: "Submission receipt",
    summary: "The exact submitted revision is fenced while review remains pending."
  },
  {
    id: "reviewed",
    label: "Reviewed",
    actor: "Reviewer",
    durability: "Review receipt",
    summary: "Reviewer identity, decision, comments, and source revision are inspectable."
  },
  {
    id: "published",
    label: "Published",
    actor: "Publisher",
    durability: "Publication receipt",
    summary: "Canonical identity, route, exact revision, and machine representation are durable."
  },
  {
    id: "superseded",
    label: "Superseded",
    actor: "Registry",
    durability: "Replacement relation",
    summary: "History remains available and points to the replacing revision or object."
  },
  {
    id: "withdrawn",
    label: "Withdrawn",
    actor: "Owner or authority",
    durability: "Withdrawal receipt",
    summary: "The object is not current, but its identity, reason, and receipts remain inspectable."
  }
];

/** @type {ContentField[]} */
export const sharedFields = [
  {
    id: "schema",
    label: "Schema",
    type: "qualified-id",
    requirement: "required",
    control: "derived",
    source: "content type selection",
    description: "Canonical schema namespace for validation and machine consumers.",
    derivedFrom: ["contentType"]
  },
  {
    id: "schemaVersion",
    label: "Schema version",
    type: "semver",
    requirement: "required",
    control: "derived",
    source: "schema registry",
    description: "Exact contract version used to validate and regenerate the object.",
    derivedFrom: ["contentType", "schema registry"]
  },
  {
    id: "contentId",
    label: "Content identity",
    type: "uri",
    requirement: "required",
    control: "registry",
    source: "publication registry",
    description: "Stable identity independent of route, title, or presentation.",
    registryOwned: true
  },
  {
    id: "contentType",
    label: "Content type",
    type: "qualified-id",
    requirement: "required",
    control: "author",
    source: "author selection",
    description: "Product-specific semantic type chosen from the schema registry."
  },
  {
    id: "title",
    label: "Title",
    type: "text",
    requirement: "required",
    control: "author",
    source: "author",
    description: "Human-readable title used across the canonical page and derived previews."
  },
  {
    id: "summary",
    label: "Summary",
    type: "text",
    requirement: "required",
    control: "author",
    source: "author",
    description: "Portable description shared by cards, search, feeds, and social metadata."
  },
  {
    id: "slug",
    label: "Slug",
    type: "path-segment",
    requirement: "optional",
    control: "author",
    source: "author or title default",
    description: "Editable route hint; publication may normalize it without changing content identity.",
    defaultValue: "slugify(title)"
  },
  {
    id: "canonicalUrl",
    label: "Canonical URL",
    type: "url",
    requirement: "required",
    control: "derived",
    source: "route registry",
    description: "Canonical public destination generated from the registered identity and route policy.",
    derivedFrom: ["contentId", "slug", "route registry"]
  },
  {
    id: "authors",
    label: "Authors",
    type: "identity-ref[]",
    requirement: "required",
    control: "identity",
    source: "identity registry",
    description: "Accountable identities referenced rather than copied profile records.",
    registryOwned: true
  },
  {
    id: "status",
    label: "Lifecycle status",
    type: "lifecycle-state",
    requirement: "required",
    control: "reviewer",
    source: "publication workflow",
    description: "Durable state confirmed by the workflow authority; never inferred by the browser."
  },
  {
    id: "locale",
    label: "Locale",
    type: "bcp47",
    requirement: "optional",
    control: "author",
    source: "author",
    description: "Language and regional context for rendering and discovery.",
    defaultValue: "en"
  },
  {
    id: "tags",
    label: "Tags",
    type: "term-ref[]",
    requirement: "optional",
    control: "author",
    source: "author + vocabulary registry",
    description: "Discovery labels resolved against the product vocabulary."
  },
  {
    id: "createdAt",
    label: "Created at",
    type: "timestamp",
    requirement: "required",
    control: "registry",
    source: "content registry",
    description: "First durable creation timestamp.",
    registryOwned: true
  },
  {
    id: "updatedAt",
    label: "Updated at",
    type: "timestamp",
    requirement: "required",
    control: "registry",
    source: "content registry",
    description: "Timestamp of the exact current revision.",
    registryOwned: true
  },
  {
    id: "revision",
    label: "Exact revision",
    type: "digest",
    requirement: "required",
    control: "registry",
    source: "deterministic publication pipeline",
    description: "Immutable digest of canonical content and resolved contract facts.",
    registryOwned: true
  },
  {
    id: "publicationReceipt",
    label: "Publication receipt",
    type: "receipt-ref",
    requirement: "optional",
    control: "registry",
    source: "publication registry",
    description: "Durable evidence linking actor, revision, status, and regeneration inputs.",
    registryOwned: true
  },
  {
    id: "provenance",
    label: "Provenance",
    type: "provenance-ref",
    requirement: "optional",
    control: "source",
    source: "source registry",
    description: "Import, syndication, transformation, and original-source chain.",
    registryOwned: true
  },
  {
    id: "legacyPermalink",
    label: "Legacy permalink",
    type: "url",
    requirement: "deprecated",
    control: "author",
    source: "legacy front matter",
    description: "Pre-v2 route field retained only for migration diagnostics.",
    replacement: "canonicalUrl"
  }
];

const authorField = (id, label, type, requirement, description, extras = {}) => ({
  id,
  label,
  type,
  requirement,
  control: "author",
  source: "author",
  description,
  ...extras
});

const controlledField = (id, label, type, requirement, control, source, description, extras = {}) => ({
  id,
  label,
  type,
  requirement,
  control,
  source,
  description,
  registryOwned: control !== "derived",
  ...extras
});

const type = (id, label, version, summary, required, optional = []) => ({
  id,
  label,
  version,
  summary,
  required: ["contentType", "title", "summary", ...required],
  optional: ["slug", "locale", "tags", ...optional]
});

/** @type {ContentContract[]} */
export const contentContracts = [
  {
    id: "www",
    label: "WWW",
    issue: 38,
    route: "/v2/www/",
    summary: "Narrative pages and product capability claims for the public language site.",
    schemaNamespace: "hara.www",
    schemaVersion: "2.0.0",
    publicationPaths: ["Markdown + front matter", "Hara publication form"],
    registryOwner: "WWW content registry",
    fields: [
      authorField("eyebrow", "Eyebrow", "text", "optional", "Short navigational context above the title."),
      authorField("hero", "Hero treatment", "asset-ref", "optional", "Registered product imagery or visual field."),
      authorField("capabilityClaims", "Capability claims", "claim[]", "optional", "Structured claims linked to proof rather than decorative marketing copy."),
      controlledField("proofRefs", "Proof references", "evidence-ref[]", "optional", "registry", "evidence registry", "Verified benchmark, specification, package, or example evidence.")
    ],
    types: [
      type("www.narrative-page", "Narrative page", "2.0.0", "Editorial overview with a deliberate argument and proof trail.", ["authors"], ["eyebrow", "hero", "proofRefs"]),
      type("www.capability", "Product capability", "2.0.0", "A bounded capability claim with registered evidence.", ["authors", "capabilityClaims", "proofRefs"], ["hero"])
    ]
  },
  {
    id: "docs",
    label: "Docs",
    issue: 38,
    route: "/v2/www/docs/",
    summary: "Guides, references, versions, and executable examples with runtime-aware evidence.",
    schemaNamespace: "hara.docs",
    schemaVersion: "2.1.0",
    publicationPaths: ["Markdown + front matter", "Hara documentation form"],
    registryOwner: "Documentation registry",
    fields: [
      authorField("audience", "Audience", "term-ref[]", "required", "Intended reader experience and task level."),
      authorField("prerequisites", "Prerequisites", "content-ref[]", "optional", "Concepts, guides, or packages needed before this content."),
      authorField("versionRange", "Version range", "version-range", "required", "Language or package versions for which the content is valid."),
      authorField("outline", "Outline", "heading-ref[]", "optional", "Stable authored structure used for local navigation."),
      controlledField("runtimeExample", "Live example", "runtime-example-ref", "optional", "runtime", "live example registry", "Executable source, backend capabilities, expected observations, and exact revision."),
      controlledField("apiSymbols", "API symbols", "symbol-ref[]", "optional", "registry", "symbol registry", "Canonical symbols referenced by a documentation page.")
    ],
    types: [
      type("docs.guide", "Guide", "2.1.0", "Task-oriented path with audience, versions, and optional runnable examples.", ["authors", "audience", "versionRange"], ["prerequisites", "outline", "runtimeExample"]),
      type("docs.reference", "Reference", "2.1.0", "Canonical API or language reference driven by registered symbols.", ["authors", "versionRange", "apiSymbols"], ["outline"]),
      type("docs.version", "Version note", "2.1.0", "Version-scoped behaviour and migration guidance.", ["authors", "versionRange"], ["prerequisites"]),
      type("docs.live-example", "Live example", "2.1.0", "Runnable documentation with fenced runtime expectations.", ["authors", "versionRange", "runtimeExample"], ["audience", "prerequisites"])
    ]
  },
  {
    id: "benchmarks",
    label: "Benchmarks",
    issue: 38,
    route: "/v2/www/benchmarks/",
    summary: "Reports, workloads, baselines, methodology, and exact evidence without collapsing incomparable results.",
    schemaNamespace: "hara.benchmarks",
    schemaVersion: "2.0.0",
    publicationPaths: ["Markdown report + front matter", "Hara evidence form"],
    registryOwner: "Benchmark evidence registry",
    fields: [
      authorField("question", "Benchmark question", "text", "required", "The bounded claim the comparison is intended to answer."),
      controlledField("workloads", "Workloads", "workload-ref[]", "required", "registry", "benchmark registry", "Registered workloads and exact source revisions."),
      controlledField("baselines", "Baselines", "baseline-ref[]", "required", "registry", "benchmark registry", "Comparison systems and their immutable configuration."),
      controlledField("methodology", "Methodology", "methodology-ref", "required", "reviewer", "methodology registry", "Reviewed measurement protocol and exclusion rules."),
      controlledField("evidence", "Evidence", "evidence-ref[]", "required", "registry", "evidence registry", "Raw samples, environment, results, and reproducibility receipts."),
      controlledField("comparability", "Comparability", "comparability-state", "optional", "reviewer", "benchmark review", "Comparable, partial, or incomparable state with a reason.")
    ],
    types: [
      type("benchmarks.report", "Benchmark report", "2.0.0", "Narrative interpretation of registered workloads and evidence.", ["authors", "question", "workloads", "baselines", "methodology", "evidence"], ["comparability"]),
      type("benchmarks.workload", "Workload", "2.0.0", "Canonical workload identity and implementation revision.", ["workloads", "methodology"], ["evidence"]),
      type("benchmarks.baseline", "Baseline", "2.0.0", "Immutable comparison system and configuration.", ["baselines"], ["evidence"]),
      type("benchmarks.methodology", "Methodology", "2.0.0", "Reviewed measurement and inclusion contract.", ["authors", "methodology"], ["comparability"]),
      type("benchmarks.evidence", "Evidence bundle", "2.0.0", "Exact samples, environment, and deterministic result receipt.", ["evidence", "workloads", "baselines"], ["comparability"])
    ]
  },
  {
    id: "specs",
    label: "Specs",
    issue: 40,
    route: "/v2/specs/",
    summary: "Proposals, versions, conformance, review state, and publication receipts.",
    schemaNamespace: "hara.specs",
    schemaVersion: "3.0.0",
    publicationPaths: ["Markdown proposal + front matter", "Hara specification form"],
    registryOwner: "Specification registry",
    fields: [
      authorField("abstract", "Abstract", "text", "required", "Bounded proposal or specification summary."),
      authorField("motivation", "Motivation", "text", "required", "Problem, constraints, and intended outcomes."),
      authorField("compatibility", "Compatibility notes", "text", "optional", "Known compatibility and migration implications."),
      controlledField("specNumber", "Specification number", "integer", "required", "registry", "specification registry", "Stable proposal or specification number."),
      controlledField("reviewDecision", "Review decision", "decision-ref", "optional", "reviewer", "specification review", "Reviewer outcome tied to the exact submitted revision."),
      controlledField("conformance", "Conformance", "conformance-ref[]", "optional", "registry", "conformance registry", "Checker results and implementation claims."),
      controlledField("specReceipt", "Publication receipt", "receipt-ref", "optional", "registry", "specification registry", "Exact accepted version and publication evidence.")
    ],
    types: [
      type("specs.proposal", "Proposal", "3.0.0", "Reviewable change with motivation and registry-assigned identity.", ["authors", "abstract", "motivation", "specNumber"], ["compatibility", "reviewDecision"]),
      type("specs.version", "Published version", "3.0.0", "Accepted specification version with durable receipt.", ["authors", "abstract", "specNumber", "specReceipt"], ["compatibility", "conformance"]),
      type("specs.conformance", "Conformance record", "3.0.0", "Checker or implementation evidence against an exact specification.", ["specNumber", "conformance"], ["reviewDecision"]),
      type("specs.publication-receipt", "Publication receipt", "3.0.0", "Registry evidence for an accepted exact version.", ["specNumber", "specReceipt"], ["reviewDecision"])
    ]
  },
  {
    id: "packages",
    label: "Packages",
    issue: 41,
    route: "/v2/packages/",
    summary: "Packages, releases, namespaces, maintainers, compatibility, and provenance.",
    schemaNamespace: "hara.packages",
    schemaVersion: "2.2.0",
    publicationPaths: ["Markdown package note + front matter", "Hara package publication form"],
    registryOwner: "Package and namespace registry",
    fields: [
      authorField("releaseNotes", "Release notes", "text", "optional", "Human explanation of a release without copying registry facts."),
      authorField("migrationNotes", "Migration notes", "text", "optional", "Consumer-facing upgrade guidance."),
      controlledField("package", "Package", "package-ref", "required", "registry", "package registry", "Canonical package identity and coordinates."),
      controlledField("namespace", "Namespace", "namespace-ref", "required", "registry", "namespace registry", "Namespace stewardship referenced from its source registry."),
      controlledField("version", "Version", "semver", "required", "registry", "release registry", "Published release version."),
      controlledField("maintainers", "Maintainers", "identity-ref[]", "required", "identity", "namespace registry", "Current maintainers and delegated scopes."),
      controlledField("compatibilityMatrix", "Compatibility", "compatibility-ref", "optional", "registry", "compatibility registry", "Runtime, language, and dependency compatibility evidence."),
      controlledField("artifactDigest", "Artifact digest", "digest", "optional", "registry", "package registry", "Exact published artifact digest.")
    ],
    types: [
      type("packages.package", "Package", "2.2.0", "Canonical package identity and discovery metadata.", ["package", "namespace", "maintainers"], ["compatibilityMatrix"]),
      type("packages.release", "Release", "2.2.0", "Immutable package release with artifact evidence.", ["package", "namespace", "version", "maintainers", "artifactDigest"], ["releaseNotes", "migrationNotes", "compatibilityMatrix"]),
      type("packages.namespace", "Namespace", "2.2.0", "Stewardship scope and publication boundary.", ["namespace", "maintainers"], ["package"]),
      type("packages.maintainer", "Maintainer record", "2.2.0", "Identity and delegated package or namespace scope.", ["namespace", "maintainers"], ["package"]),
      type("packages.compatibility", "Compatibility record", "2.2.0", "Verified compatibility across exact versions.", ["package", "version", "compatibilityMatrix"], ["artifactDigest"])
    ]
  },
  {
    id: "world",
    label: "World",
    issue: 42,
    route: "/v2/world/",
    summary: "Articles, clippings, feeds, profiles, source provenance, and accountable bot ownership.",
    schemaNamespace: "hara.world",
    schemaVersion: "2.0.0",
    publicationPaths: ["Markdown article + front matter", "Hara clipping/feed form"],
    registryOwner: "World content and source registries",
    fields: [
      authorField("bodyKind", "Body kind", "enum", "required", "Article, clipping, feed note, profile note, or bot disclosure."),
      authorField("discussionPrompt", "Discussion prompt", "text", "optional", "Optional durable discussion framing."),
      controlledField("source", "Canonical source", "source-ref", "optional", "source", "source registry", "Original URL, provider, author, timestamps, and retrieval evidence."),
      controlledField("syndication", "Syndication", "syndication-ref", "optional", "source", "source registry", "Import and transformation chain for syndicated content."),
      controlledField("profile", "Profile", "identity-ref", "optional", "identity", "identity registry", "Contributor identity and profile facts."),
      controlledField("botOwner", "Bot owner", "identity-ref", "optional", "identity", "identity registry", "Accountable human or organisation owner."),
      controlledField("botPolicy", "Bot policy", "policy-ref", "optional", "reviewer", "World policy registry", "Purpose, sources, capabilities, and presence requirements."),
      controlledField("moderation", "Moderation state", "moderation-ref", "optional", "reviewer", "World moderation", "Review and visibility state tied to an exact revision.")
    ],
    types: [
      type("world.article", "Article", "2.0.0", "Original World article with accountable authorship.", ["authors", "bodyKind"], ["discussionPrompt", "moderation"]),
      type("world.clipping", "Clipping", "2.0.0", "Imported excerpt or link retaining canonical source provenance.", ["bodyKind", "source", "provenance"], ["syndication", "discussionPrompt", "moderation"]),
      type("world.feed", "Feed registration", "2.0.0", "Source feed submitted for discovery and review.", ["authors", "source"], ["syndication", "moderation"]),
      type("world.profile", "Contributor profile", "2.0.0", "Identity-backed contribution, package, namespace, and badge view.", ["profile"], ["discussionPrompt"]),
      type("world.bot", "Owned bot", "2.0.0", "Automation with accountable ownership, policy, and source disclosure.", ["profile", "botOwner", "botPolicy"], ["source", "moderation"])
    ]
  },
  {
    id: "learn",
    label: "Learn",
    issue: 43,
    route: "/v2/learn/",
    summary: "Lessons, concepts, prerequisites, exercises, projects, and progress metadata.",
    schemaNamespace: "hara.learn",
    schemaVersion: "2.0.0",
    publicationPaths: ["Markdown lesson + front matter", "Hara curriculum form"],
    registryOwner: "Curriculum and progress registries",
    fields: [
      authorField("learningObjectives", "Learning objectives", "text[]", "required", "Observable outcomes for the learner."),
      authorField("prerequisiteConcepts", "Prerequisite concepts", "content-ref[]", "optional", "Required concepts resolved from the curriculum graph."),
      authorField("estimatedMinutes", "Estimated minutes", "integer", "optional", "Planning estimate, not progress truth."),
      authorField("exerciseSpec", "Exercise specification", "exercise-spec", "optional", "Prompt, starter source, checks, hints, and expected evidence."),
      controlledField("conceptGraph", "Concept graph", "concept-ref[]", "optional", "registry", "curriculum registry", "Canonical concepts and dependency relations."),
      controlledField("runtimeExample", "Runnable environment", "runtime-example-ref", "optional", "runtime", "learning runtime registry", "Fenced source, backend, capabilities, and expected observations."),
      controlledField("progress", "Progress", "progress-ref", "optional", "registry", "learner progress registry", "Account-scoped attempts, completion evidence, and exact curriculum revision.")
    ],
    types: [
      type("learn.lesson", "Lesson", "2.0.0", "Guided learning sequence with objectives and optional runnable work.", ["authors", "learningObjectives"], ["prerequisiteConcepts", "estimatedMinutes", "runtimeExample", "conceptGraph"]),
      type("learn.concept", "Concept", "2.0.0", "Canonical explanation in the curriculum dependency graph.", ["authors", "learningObjectives", "conceptGraph"], ["prerequisiteConcepts"]),
      type("learn.exercise", "Exercise", "2.0.0", "Bounded practice task with inspectable checking contract.", ["authors", "learningObjectives", "exerciseSpec"], ["runtimeExample", "prerequisiteConcepts"]),
      type("learn.project", "Project", "2.0.0", "Multi-step useful build with evidence and reflection.", ["authors", "learningObjectives", "exerciseSpec"], ["runtimeExample", "prerequisiteConcepts", "estimatedMinutes"]),
      type("learn.progress", "Progress record", "2.0.0", "Account-scoped completion evidence against an exact curriculum revision.", ["progress"], ["conceptGraph"])
    ]
  }
];

export const contentTypeInventory = contentContracts.flatMap((contract) =>
  contract.types.map((entry) => ({ ...entry, family: contract.id, familyLabel: contract.label }))
);

export const registryStats = {
  families: contentContracts.length,
  types: contentTypeInventory.length,
  sharedFields: sharedFields.length,
  lifecycleStates: lifecycleStates.length,
  controlledFields: sharedFields.filter((field) => field.control !== "author").length +
    contentContracts.flatMap((contract) => contract.fields).filter((field) => field.control !== "author").length
};

export const relationships = [
  {
    id: "authors",
    label: "Authors → identities",
    owner: "Identity registry",
    cardinality: "many-to-many",
    rule: "Front matter stores identity references, never copied display names, avatars, roles, or badges."
  },
  {
    id: "packages",
    label: "Content → packages",
    owner: "Package registry",
    cardinality: "many-to-many",
    rule: "Package coordinates, releases, maintainers, and artifact digests remain registry facts."
  },
  {
    id: "namespaces",
    label: "Packages → namespaces",
    owner: "Namespace registry",
    cardinality: "many-to-one",
    rule: "A content object references stewardship scope instead of duplicating maintainer authority."
  },
  {
    id: "sources",
    label: "Imports → sources",
    owner: "Source registry",
    cardinality: "many-to-one",
    rule: "Original URL, provider, retrieval time, transformations, and syndication permission form a provenance chain."
  },
  {
    id: "evidence",
    label: "Claims → evidence",
    owner: "Evidence registry",
    cardinality: "many-to-many",
    rule: "Visible claims name exact evidence revisions; missing or incomparable evidence remains explicit."
  },
  {
    id: "specifications",
    label: "Conformance → specifications",
    owner: "Specification registry",
    cardinality: "many-to-one",
    rule: "Conformance always targets an exact specification version and checker contract."
  },
  {
    id: "runtime",
    label: "Live examples → runtime receipts",
    owner: "Runtime registry",
    cardinality: "many-to-many",
    rule: "Source revision, backend, capabilities, expected observations, and execution receipts stay fenced."
  }
];

export const applicationContractMap = [
  { issue: 38, application: "WWW / Docs / Benchmarks", families: ["www", "docs", "benchmarks"], contract: "Narrative, guide, reference, live-example, report, workload, methodology, and evidence metadata." },
  { issue: 39, application: "Playground", families: ["docs", "learn"], contract: "Live-example identity, source revision, runtime capability, shareable route, and execution receipt references." },
  { issue: 40, application: "Specs", families: ["specs"], contract: "Proposal, version, review, conformance, status, and publication-receipt metadata." },
  { issue: 41, application: "Packages", families: ["packages"], contract: "Package, release, namespace, maintainer, compatibility, and artifact provenance metadata." },
  { issue: 42, application: "World", families: ["world"], contract: "Article, clipping, feed, profile, accountable bot, source, syndication, and moderation metadata." },
  { issue: 43, application: "Learn", families: ["learn"], contract: "Lesson, concept, prerequisite, exercise, project, runtime, and progress metadata." }
];

/** @type {ContentSpecimen[]} */
export const specimens = [
  {
    id: "valid-docs-guide",
    label: "Valid · published Docs guide",
    state: "valid",
    contentType: "docs.guide",
    schemaVersion: "2.1.0",
    author: {
      contentType: "docs.guide",
      title: "Build a durable work pipeline",
      summary: "Model replayable work, checkpointed steps, and explicit capability boundaries.",
      slug: "durable-work-pipeline",
      locale: "en-AU",
      tags: ["work", "durability", "runtime"],
      audience: ["application-developer"],
      prerequisites: ["learn.concept/work-algebra"],
      versionRange: ">=1.8 <2.0",
      outline: ["model", "steps", "receipts"]
    },
    controlled: {
      contentId: "hara:docs:guide:durable-work-pipeline",
      authors: ["identity:github:hoebat"],
      status: "published",
      createdAt: "2026-08-12T04:10:00Z",
      updatedAt: "2026-08-19T12:44:00Z",
      revision: "sha256:72a194a3",
      publicationReceipt: "receipt:docs:pub-1098"
    },
    derived: {
      schema: "hara.docs/guide",
      schemaVersion: "2.1.0",
      canonicalUrl: "https://hara-lang.org/docs/guides/durable-work-pipeline"
    }
  },
  {
    id: "imported-world-clipping",
    label: "Imported · World clipping",
    state: "imported",
    contentType: "world.clipping",
    schemaVersion: "2.0.0",
    author: {
      contentType: "world.clipping",
      title: "A useful discussion of algebraic effects",
      summary: "A clipped external article retained at its canonical source with a World discussion context.",
      slug: "algebraic-effects-discussion",
      bodyKind: "clipping",
      discussionPrompt: "Which boundary should Hara keep explicit?"
    },
    controlled: {
      contentId: "hara:world:clipping:gw-4821",
      authors: ["identity:github:hoebat"],
      status: "reviewed",
      createdAt: "2026-08-18T08:12:00Z",
      updatedAt: "2026-08-18T08:16:00Z",
      revision: "sha256:84cb31e8",
      provenance: "source-chain:world:src-821",
      source: "source:web:article-2281",
      syndication: "syndication:world:clip-882",
      moderation: "moderation:world:review-220"
    },
    derived: {
      schema: "hara.world/clipping",
      schemaVersion: "2.0.0",
      canonicalUrl: "https://world.hara-lang.org/clippings/gw-4821"
    },
    provenance: {
      originalUrl: "https://example.org/algebraic-effects",
      provider: "web",
      retrievedAt: "2026-08-18T08:11:42Z",
      transformations: ["readability-extract", "excerpt-240-words"],
      originalDigest: "sha256:9dd2e7b4",
      importReceipt: "receipt:source:imp-592"
    }
  },
  {
    id: "invalid-spec-proposal",
    label: "Invalid + deprecated · Specs proposal",
    state: "invalid",
    contentType: "specs.proposal",
    schemaVersion: "2.4.0",
    author: {
      contentType: "specs.proposal",
      title: "Schema-native publication",
      summary: "",
      abstract: "Make content contracts inspectable and deterministic.",
      legacyPermalink: "/old/specs/schema-native",
      canonicalUrl: "https://specs.hara-lang.org/9999",
      specNumber: 9999,
      authors: ["copied display name"],
      status: "published"
    },
    controlled: {},
    derived: {
      schema: "hara.specs/proposal"
    }
  },
  {
    id: "migrated-package-release",
    label: "Migrated · Package release 1.x → 2.2",
    state: "migrated",
    contentType: "packages.release",
    schemaVersion: "2.2.0",
    author: {
      contentType: "packages.release",
      title: "std.work 1.8.0",
      summary: "Separates replayable work from checkpointed steps while retaining explicit receipts.",
      slug: "std-work-1-8-0",
      releaseNotes: "Adds the narrow IWork, IWorkStore, and IWorkExecutor boundary.",
      migrationNotes: "Legacy owner and package-coordinate fields now resolve through registries."
    },
    controlled: {
      contentId: "hara:packages:release:std.work:1.8.0",
      authors: ["identity:github:hoebat"],
      status: "published",
      createdAt: "2026-08-10T01:12:00Z",
      updatedAt: "2026-08-19T11:02:00Z",
      revision: "sha256:0cc8d46f",
      publicationReceipt: "receipt:packages:pub-817",
      package: "package:std.work",
      namespace: "namespace:std",
      version: "1.8.0",
      maintainers: ["identity:github:hoebat"],
      compatibilityMatrix: "compatibility:std.work:1.8.0",
      artifactDigest: "sha256:artifact-39af"
    },
    derived: {
      schema: "hara.packages/release",
      schemaVersion: "2.2.0",
      canonicalUrl: "https://packages.hara-lang.org/std.work/1.8.0"
    },
    migration: {
      from: "hara.packages/release@1.4.0",
      to: "hara.packages/release@2.2.0",
      transforms: [
        "owner → maintainers identity references",
        "packageCoordinate → package registry reference",
        "permalink → canonicalUrl derived from registry identity"
      ],
      inputRevision: "sha256:legacy-2f19",
      outputRevision: "sha256:0cc8d46f",
      generator: "content.migrate@2.2.0",
      receipt: "receipt:migration:mig-5501"
    }
  }
];

/** @param {string} id */
export function contentContractById(id) {
  return contentContracts.find((contract) => contract.id === id);
}

/** @param {string} id */
export function contentTypeById(id) {
  return contentTypeInventory.find((entry) => entry.id === id);
}

/** @param {string} family */
export function fieldInventoryForContract(family) {
  const contract = contentContractById(family);
  return contract ? [...sharedFields, ...contract.fields] : [...sharedFields];
}

/** @param {string} contentType */
export function fieldInventoryForType(contentType) {
  const entry = contentTypeById(contentType);
  return entry ? fieldInventoryForContract(entry.family) : [...sharedFields];
}

/** @param {string} contentType */
export function requiredFieldsForType(contentType) {
  const entry = contentTypeById(contentType);
  if (!entry) return [];
  return [...new Set(["schema", "schemaVersion", "contentId", ...entry.required, "canonicalUrl", "createdAt", "updatedAt", "revision", "status"])]
    .map((id) => fieldInventoryForType(contentType).find((field) => field.id === id))
    .filter(Boolean);
}

/** @param {string} contentType */
export function browserEditableFields(contentType) {
  return fieldInventoryForType(contentType).filter((field) => field.control === "author" && field.requirement !== "deprecated");
}

/** @param {string} contentType */
export function controlledFields(contentType) {
  return fieldInventoryForType(contentType).filter((field) => !["author", "derived"].includes(field.control));
}

/** @param {string} contentType */
export function derivedFields(contentType) {
  return fieldInventoryForType(contentType).filter((field) => field.control === "derived");
}

const isMissing = (value) => value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);

/** @param {ContentSpecimen} specimen */
export function combinedSpecimenValues(specimen) {
  return {
    ...specimen.author,
    ...specimen.controlled,
    ...specimen.derived
  };
}

/** @param {ContentSpecimen} specimen */
export function validateSpecimen(specimen) {
  /** @type {ValidationMessage[]} */
  const messages = [];
  const typeEntry = contentTypeById(specimen.contentType);

  if (!typeEntry) {
    return [{ level: "error", code: "unknown-content-type", field: "contentType", message: `Unknown content type ${specimen.contentType}.` }];
  }

  const contract = contentContractById(typeEntry.family);
  const fields = fieldInventoryForType(specimen.contentType);
  const values = combinedSpecimenValues(specimen);

  for (const field of requiredFieldsForType(specimen.contentType)) {
    if (field && isMissing(values[field.id])) {
      messages.push({
        level: "error",
        code: "required-field-missing",
        field: field.id,
        message: `${field.label} is required by ${typeEntry.id}@${typeEntry.version}.`
      });
    }
  }

  for (const id of Object.keys(specimen.author)) {
    const field = fields.find((candidate) => candidate.id === id);
    if (!field) {
      messages.push({ level: "error", code: "unknown-field", field: id, message: `${id} is not part of ${typeEntry.id}.` });
      continue;
    }
    if (!["author"].includes(field.control)) {
      messages.push({
        level: "error",
        code: field.registryOwned ? "registry-owned-field" : "controlled-field",
        field: id,
        message: `${field.label} is ${controlLabels[field.control].toLowerCase()} and cannot be authored in the browser.`
      });
    }
    if (field.requirement === "deprecated") {
      messages.push({
        level: "warning",
        code: "deprecated-field",
        field: id,
        message: `${field.label} is deprecated; use ${field.replacement ?? "the current contract"}.`
      });
    }
  }

  if (contract && specimen.schemaVersion !== contract.schemaVersion) {
    messages.push({
      level: "warning",
      code: "schema-migration-required",
      field: "schemaVersion",
      message: `${specimen.schemaVersion} must migrate to ${contract.schemaVersion} before publication.`
    });
  }

  for (const field of derivedFields(specimen.contentType)) {
    if (!field.derivedFrom?.length) {
      messages.push({
        level: "error",
        code: "derived-source-missing",
        field: field.id,
        message: `${field.label} must name its derivation inputs.`
      });
    }
  }

  if (specimen.provenance) {
    messages.push({
      level: "notice",
      code: "provenance-attached",
      field: "provenance",
      message: "Original source, retrieval, transformations, digest, and import receipt are attached."
    });
  }

  if (specimen.migration) {
    messages.push({
      level: "notice",
      code: "migration-receipt-attached",
      field: "schemaVersion",
      message: `Deterministic migration receipt ${String(specimen.migration.receipt)} links input and output revisions.`
    });
  }

  if (messages.length === 0) {
    messages.push({
      level: "notice",
      code: "valid",
      field: "contentType",
      message: `${typeEntry.id}@${typeEntry.version} satisfies required-field and control-boundary checks.`
    });
  }

  return messages;
}

const scalar = (value) => {
  if (typeof value === "string") return /[:#\n{}\[\],&*?]|^[-!%@`]|^\s|\s$/.test(value) ? JSON.stringify(value) : value;
  if (value === null) return "null";
  return String(value);
};

const yamlLines = (value, indent = 0) => {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (item && typeof item === "object") return [`${pad}-`, ...yamlLines(item, indent + 2)];
      return [`${pad}- ${scalar(item)}`];
    });
  }
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => {
      if (item && typeof item === "object") return [`${pad}${key}:`, ...yamlLines(item, indent + 2)];
      return [`${pad}${key}: ${scalar(item)}`];
    });
  }
  return [`${pad}${scalar(value)}`];
};

const haraValue = (value) => {
  if (Array.isArray(value)) return `[${value.map(haraValue).join(" ")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value).map(([key, item]) => `:${key} ${haraValue(item)}`).join(" ")}}`;
  }
  if (typeof value === "string") return JSON.stringify(value);
  if (value === null) return "nil";
  return String(value);
};

/** @param {ContentSpecimen} specimen */
export function frontmatterRepresentations(specimen) {
  const values = combinedSpecimenValues(specimen);
  const canonical = Object.fromEntries(Object.entries(values).sort(([a], [b]) => a.localeCompare(b)));
  const yaml = yamlLines(canonical).join("\n");
  const json = JSON.stringify(canonical, null, 2);
  const hara = `(content/frontmatter\n  ${haraValue(canonical)})`;

  return {
    yaml,
    json,
    hara,
    markdown: `---\n${yaml}\n---\n\n# ${String(values.title ?? "Untitled")}`,
    haraPublication: `(content/publish\n  {:frontmatter ${haraValue(canonical)}\n   :body (document/body ...)})`
  };
}

/** @param {ContentSpecimen} specimen */
export function previewFromSpecimen(specimen) {
  const values = combinedSpecimenValues(specimen);
  const contract = contentContractById(contentTypeById(specimen.contentType)?.family ?? "");
  const title = String(values.title ?? "Untitled");
  const summary = String(values.summary ?? "No summary supplied.");
  const url = String(values.canonicalUrl ?? `${contract?.route ?? "/"}${String(values.slug ?? "draft")}`);
  const authors = Array.isArray(values.authors) ? values.authors.map(String) : [];

  return {
    route: { path: new URL(url, "https://hara-lang.org").pathname, canonicalUrl: url, contentId: String(values.contentId ?? "pending") },
    card: { eyebrow: contract?.label ?? "Content", title, summary, meta: `${authors.length || 1} author · ${String(values.updatedAt ?? "draft")}` },
    feed: { title, summary, source: specimen.provenance ? String(specimen.provenance.originalUrl) : url, status: String(values.status ?? "draft") },
    search: { title, description: summary, type: specimen.contentType, revision: String(values.revision ?? "unpublished") },
    social: { title, description: summary, url, type: "article", imageAlt: `${contract?.label ?? "Hara"} · ${title}` },
    machine: { "@context": "https://hara-lang.org/content/v2", "@id": String(values.contentId ?? url), "@type": specimen.contentType, url, name: title, description: summary, revision: values.revision ?? null }
  };
}

export const specimenValidation = Object.fromEntries(specimens.map((specimen) => [specimen.id, validateSpecimen(specimen)]));
