export default {
  common: {
    appName: "Iconic Shifty",
    description: "Iconic Shift",
  },
  home: {
    dbConnected: "PostgreSQL connected at {{time}}",
  },
  objectives: {
    title: "Objectives",
    createNew: "Create New Objective",
    titleLabel: "Title",
    titlePlaceholder: "Enter objective title",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Enter objective description (optional)",
    submit: "Create Objective",
    noObjectives: "No objectives yet. Create your first one!",
    created: "Objective created successfully",
    titleRequired: "Title is required",
  },
  errors: {
    oops: "Oops!",
    unexpected: "An unexpected error occurred.",
    notFound: "404",
    error: "Error",
    pageNotFound: "The requested page could not be found.",
  },
} as const;
