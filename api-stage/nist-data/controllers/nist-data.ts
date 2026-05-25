import { factories } from "@strapi/strapi";

export default factories.createCoreController(
  "api::nist-data.nist-data",
  ({ strapi }) => ({

    // GET /nist-data/matrix
    async getNistMatrix(ctx) {
      try {
        const subs = await strapi.db
          .query("api::nist-data.nist-data")
          .findMany({
            populate: {
              challenges: { select: ["id", "documentId", "name"] },
            },
          });

        const matrix = subs.reduce((acc, sub) => {
          const fnId = sub.function_id;
          const catId = sub.category_id;

          if (!acc[fnId]) {
            acc[fnId] = {
              function_id: fnId,
              function_name: sub.function_name,
              categories: {},
            };
          }
          if (!acc[fnId].categories[catId]) {
            acc[fnId].categories[catId] = {
              category_id: catId,
              category_name: sub.category_name,
              subcategories: [],
            };
          }

          acc[fnId].categories[catId].subcategories.push({
            id: sub.id,
            documentId: sub.documentId,
            sub_id: sub.sub_id,
            sub_name: sub.sub_name,
            challengeCount: sub.challenges?.length ?? 0,
            challenges: sub.challenges?.map((ch) => ({
              documentId: ch.documentId,
              name: ch.name,
            })),
          });

          return acc;
        }, {} as Record<string, any>);

        // Flatten categories object -> array (frontend-friendly)
        const data = Object.values(matrix).map((fn: any) => ({
          function_id: fn.function_id,
          function_name: fn.function_name,
          categories: Object.values(fn.categories),
        }));

        return ctx.send({ status: "ok", data });

      } catch (err) {
        strapi.log.error("❌ getNistMatrix Error:", err);
        return ctx.internalServerError("Failed to fetch NIST matrix");
      }
    },

    // PUT /nist-data/challenge/:challengeDocumentId/link
    async linkNistToChallenge(ctx) {
      try {
        const { challengeDocumentId } = ctx.params;
        const { nistDocumentIds } = ctx.request.body as {
          nistDocumentIds: string[];
        };

        if (!challengeDocumentId) {
          return ctx.badRequest("Missing challengeDocumentId");
        }

        if (!Array.isArray(nistDocumentIds)) {
          return ctx.badRequest("nistDocumentIds must be an array");
        }

        const challenge = await strapi.db
          .query("api::challenge.challenge")
          .findOne({
            where: { documentId: challengeDocumentId },
            select: ["id", "documentId"],
          });

        if (!challenge) {
          return ctx.notFound("Challenge not found");
        }

        const nistRecords = await strapi.db
          .query("api::nist-data.nist-data")
          .findMany({
            where: { documentId: { $in: nistDocumentIds } },
            select: ["id", "documentId"],
          });

        if (nistRecords.length === 0) {
          return ctx.badRequest("No valid NIST subcategories found");
        }

        await strapi.db.query("api::challenge.challenge").update({
          where: { id: challenge.id },
          data: {
            nist_datas: nistRecords.map((n) => n.id),
          },
        });

        return ctx.send({
          status: "ok",
          challengeDocumentId,
          linkedCount: nistRecords.length,
          linked: nistRecords.map((n) => n.documentId),
        });

      } catch (err) {
        strapi.log.error("❌ linkNistToChallenge Error:", err);
        return ctx.internalServerError("Failed to link NIST subcategories");
      }
    },

    // DELETE /nist-data/challenge/:challengeDocumentId/unlink
    async unlinkNistFromChallenge(ctx) {
      try {
        const { challengeDocumentId } = ctx.params;
        const { nistDocumentIds } = ctx.request.body as {
          nistDocumentIds: string[];
        };

        if (!challengeDocumentId) {
          return ctx.badRequest("Missing challengeDocumentId");
        }

        if (!Array.isArray(nistDocumentIds)) {
          return ctx.badRequest("nistDocumentIds must be an array");
        }

        const challenge = await strapi.db
          .query("api::challenge.challenge")
          .findOne({
            where: { documentId: challengeDocumentId },
            select: ["id", "documentId"],
            populate: {
              nist_datas: { select: ["id", "documentId"] },
            },
          });

        if (!challenge) {
          return ctx.notFound("Challenge not found");
        }

        const remaining = challenge.nist_datas
          ?.filter((n) => !nistDocumentIds.includes(n.documentId))
          .map((n) => n.id) ?? [];

        await strapi.db.query("api::challenge.challenge").update({
          where: { id: challenge.id },
          data: {
            nist_datas: remaining,
          },
        });

        return ctx.send({
          status: "ok",
          challengeDocumentId,
          remainingCount: remaining.length,
        });

      } catch (err) {
        strapi.log.error("❌ unlinkNistFromChallenge Error:", err);
        return ctx.internalServerError("Failed to unlink NIST subcategories");
      }
    },

  })
);
