const { poolPromise } = require("../../config/database");

const checkInFunctions = {
  async getCheckIns(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get checkIns
        const [checkIns] = await pool.query(
          `
            select date, id from checkIns
            where userId = ?
            `,
          [userId]
        );

        // get questions/answers
        const [questions] = await pool.query(
          `
            select ans.*, qst.question, qst.type, qst.fullWidth, qst.textArea
            from checkInsQuestionsAnswers ans
            left join checkInsQuestions qst
              on ans.questionId = qst.id
            left join checkIns chk
              on ans.checkInId = chk.id
            where chk.userId = ?
            `,
          [userId]
        );

        const checkInObjs = checkIns.reduce((acc, val) => {
          const retArr = [...acc];

          const matchingQuestions = questions.filter(
            (q) => q.checkInId === val.id
          );

          retArr.push({ ...val, questions: matchingQuestions });

          return retArr;
        }, []);
        resolve(checkInObjs);
      } catch (e) {
        reject(e);
      }
    });
  },
  async getCheckInsTemplates() {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get templates
        const [templates] = await pool.query(
          `
            select id, name, isDefault from checkInsTemplates
            `
        );

        // get questions
        const [questions] = await pool.query(
          `
            select tmp.templateId, tmp.questionId, tmp.orderId, qst.question, qst.type, qst.fullWidth, qst.textArea
            from checkInsTemplatesQuestions tmp
            left join checkInsQuestions qst
              on tmp.questionId = qst.id
            `
        );

        const templateObjs = templates.reduce((acc, val) => {
          const retArr = [...acc];

          const matchingQuestions = questions.filter(
            (q) => q.templateId === val.id
          );

          retArr.push({ ...val, questions: matchingQuestions });

          return retArr;
        }, []);
        resolve(templateObjs);
      } catch (e) {
        reject(e);
      }
    });
  },
};

module.exports = checkInFunctions;
