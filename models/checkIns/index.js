const { poolPromise } = require("../../config/database");

const checkInFunctions = {
  async getCheckIns(userId) {
    return new Promise(async function (resolve, reject) {
      try {
        const pool = await poolPromise;
        // get checkIns
        const [checkIns] = await pool.query(
          `
            select * from checkIns
            where userId = ?
            `,
          [userId]
        );

        // get questions/answers
        const [questions] = await pool.query(
          `
            select ans.*, qst.question
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
};

module.exports = checkInFunctions;
