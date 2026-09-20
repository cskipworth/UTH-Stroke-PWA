// Define the quiz flow using a graph-like structure for branching
    const quizData = {
        "start": {
            text: "Can the patient live alone without any help from another person? This includes bathing, using the toilet, preparing or getting meals, shopping and managing finances.",
            options: [
                { text: "Yes", nextStep: "Q2" },
                { text: "No", nextStep: "Q4" }
            ]
        },
        "Q2": {
            text: "Can the patient do everything they were doing just before the stroke even if slower and not so much?",
            options: [
                { text: "Yes", nextStep: "Q3" },
                { text: "No", nextStep: "result-2" }
            ]
        },
        "Q3": {
            text: "Is the patient completely back to how they were just before the stroke?",
            options: [
                { text: "Yes", nextStep: "result-0" },
                { text: "No", nextStep: "result-1" }
            ]
        },
        "Q4": {
            text: "Can the patient walk from one room to another without help from another person?",
            options: [
                { text: "Yes", nextStep: "result-3" },
                { text: "No", nextStep: "Q5" }
            ]
        },
        "Q5": {
            text: "Can the patient sit up in bed without any help?",
            options: [
                { text: "Yes", nextStep: "result-4" }, 
                { text: "No", nextStep: "result-5" } 
            ]
        },
        // Results nodes
        "result-0": {
            text: "MRS Score: 0 - No symptoms at all. The patient has fully recovered from the stroke.",
            isResult: true
        },
        "result-1": {
            text: "MRS Score: 1 - Minimal symptoms. The patient has some residual effects but can manage independently.",
            isResult: true
        },
        "result-2": {
            text: "MRS Score: 2 - Mild symptoms. The patient has noticeable residual effects but can manage most activities independently.",
            isResult: true
        },
        "result-3": {
            text: "MRS Score: 3 - Moderate symptoms. The patient has significant residual effects and needs some assistance with daily activities.",
            isResult: true
        },
        "result-4": {
            text: "MRS Score: 4 - Severe symptoms. The patient has severe residual effects and requires substantial assistance with daily activities.",
            isResult: true
        },
        "result-5": {
            text: "MRS Score: 5 - Very severe symptoms. The patient has very severe residual effects and requires constant assistance with daily activities.",
            isResult: true
        }
    };

    const quizContainer = document.getElementById('quiz');

    function renderStep(stepKey) {
        const step = quizData[stepKey];
        quizContainer.innerHTML = '';

        if (step.isResult) {
            // Render the final result view
            const resultElement = document.createElement('div');
            resultElement.className = 'result';
            resultElement.innerText = step.text;
            quizContainer.appendChild(resultElement);

            const restartBtn = document.createElement('button');
            restartBtn.className = 'restart-btn';
            restartBtn.innerText = 'Take Quiz Again';
            restartBtn.onclick = () => renderStep('start');
            quizContainer.appendChild(restartBtn);
        } else {
            // Render the question view
            const questionElement = document.createElement('div');
            questionElement.className = 'question';
            questionElement.innerText = step.text;
            quizContainer.appendChild(questionElement);

            const optionsContainer = document.createElement('div');
            optionsContainer.className = 'options-container';

            step.options.forEach(option => {
                const button = document.createElement('button');
                button.className = 'option-btn';
                button.innerText = option.text;
                button.onclick = () => renderStep(option.nextStep);
                optionsContainer.appendChild(button);
            });

            quizContainer.appendChild(optionsContainer);
        }
    }

    // Initialize the quiz at the start node
    renderStep('start');