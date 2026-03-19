export async function createQuiz(quiz) {
  const response = await fetch("http://localhost:8080/api/quizzes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(quiz)
  });

  return response.json();
}