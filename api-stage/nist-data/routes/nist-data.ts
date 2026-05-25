export default {
  routes: [
    {
      method: "GET",
      path: "/nist-data/matrix",
      handler: "nist-data.getNistMatrix",
      config: { policies: [], middlewares: [] },
    },
    {
      method: "PUT",
      path: "/nist-data/challenge/:challengeDocumentId/link",
      handler: "nist-data.linkNistToChallenge",
      config: { policies: [], middlewares: [] },
    },
    {
      method: "DELETE",
      path: "/nist-data/challenge/:challengeDocumentId/unlink",
      handler: "nist-data.unlinkNistFromChallenge",
      config: { policies: [], middlewares: [] },
    },
  ],
};
