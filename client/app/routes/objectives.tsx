import { useTranslation } from "react-i18next";
import { Form, useActionData } from "react-router";

import { database } from "~/database/context";
import { ObjectiveModel } from "~/database/models/objectives";
import i18n from "~/i18n";
import type { Route } from "./+types/objectives";

export function meta({}: Route.MetaArgs) {
  const t = i18n.t.bind(i18n);
  return [
    { title: `${t("objectives.title")} - ${t("common.appName")}` },
    { name: "description", content: t("objectives.title") },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = database();
  const objectiveModel = new ObjectiveModel(db);
  const objectives = await objectiveModel.findAll();

  return {
    csrfToken: context.csrfToken,
    objectives,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  const description = formData.get("description");

  // Validate CSRF token
  const csrfToken = formData.get("csrf_token");
  if (csrfToken !== context.csrfToken) {
    return {
      error: "Invalid request",
      success: false,
    };
  }

  // Validate title
  if (!title || typeof title !== "string" || title.trim() === "") {
    return {
      error: i18n.t("objectives.titleRequired"),
      success: false,
    };
  }

  const db = database();
  const objectiveModel = new ObjectiveModel(db);

  await objectiveModel.create({
    title: title.trim(),
    description:
      description && typeof description === "string"
        ? description.trim()
        : undefined,
  });

  return {
    success: true,
    message: i18n.t("objectives.created"),
  };
}

export default function Objectives({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { t } = useTranslation();

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t("objectives.title")}</h1>

        {/* Create Objective Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            {t("objectives.createNew")}
          </h2>

          {actionData?.success && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
              {actionData.message}
            </div>
          )}

          {actionData?.error && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 rounded">
              {actionData.error}
            </div>
          )}

          <Form method="post" className="space-y-4">
            <input
              type="hidden"
              name="csrf_token"
              value={loaderData.csrfToken}
            />

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium mb-2"
              >
                {t("objectives.titleLabel")}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                placeholder={t("objectives.titlePlaceholder")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium mb-2"
              >
                {t("objectives.descriptionLabel")}
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                placeholder={t("objectives.descriptionPlaceholder")}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              {t("objectives.submit")}
            </button>
          </Form>
        </div>

        {/* Objectives List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">
            {t("objectives.title")}
          </h2>

          {loaderData.objectives.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">
              {t("objectives.noObjectives")}
            </p>
          ) : (
            <div className="space-y-4">
              {loaderData.objectives.map((objective) => (
                <div
                  key={objective.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <h3 className="text-xl font-semibold mb-2">
                    {objective.title}
                  </h3>
                  {objective.description && (
                    <p className="text-gray-600 dark:text-gray-400">
                      {objective.description}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    Created: {new Date(objective.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
