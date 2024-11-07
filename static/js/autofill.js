function fetchOptions(field, input, showAll = false) {
    const query = showAll ? '' : input.value.toLowerCase();  // Show all if no query

    fetch(`/get_options/${field}`)
        .then(response => response.json())
        .then(data => {
            const suggestions = showAll ? data : data.filter(option => option.toLowerCase().includes(query));
            const suggestionsBox = document.getElementById(`${field}-suggestions`);
            suggestionsBox.innerHTML = '';  // Clear previous suggestions

            suggestions.forEach(option => {
                const suggestionItem = document.createElement('div');
                suggestionItem.classList.add('suggestion-item');
                suggestionItem.textContent = option;
                suggestionItem.onclick = () => {
                    addChoice(field, option);
                    suggestionsBox.innerHTML = '';
                    input.value = '';  // Clear input after selecting an option
                };
                suggestionsBox.appendChild(suggestionItem);
            });
            suggestionsBox.style.display = 'block';  // Ensure suggestions box is visible
        });
}

// Show all suggestions on focus
function handleFocus(field, input) {
    fetchOptions(field, input, true);  // Call with `showAll` flag
}

// Hide suggestions on blur
function handleBlur(field) {
    const suggestionsBox = document.getElementById(`${field}-suggestions`);
    setTimeout(() => {
        suggestionsBox.style.display = 'none';  // Hide the suggestions after blur
    }, 100);  // Delay to allow clicking on suggestions
}

function addChoice(field, choice) {
    const choicesContainer = document.getElementById(`${field}-choices`);

    // Check if the choice already exists
    if ([...choicesContainer.children].some(child => child.textContent === choice + ' ✖')) return;

    const choiceTag = document.createElement('div');
    choiceTag.classList.add('choice-tag');
    choiceTag.textContent = choice;

    // Add "X" symbol for removal
    const closeIcon = document.createElement('span');
    closeIcon.textContent = ' ✖';
    closeIcon.style.marginLeft = '5px';
    closeIcon.style.cursor = 'pointer';
    closeIcon.onclick = () => {
        choicesContainer.removeChild(choiceTag);
    };

    choiceTag.appendChild(closeIcon);
    choicesContainer.appendChild(choiceTag);
}

function handleEnterKey(event, field) {
    if (event.key === 'Enter') {
        event.preventDefault();  // Prevent form submission
        const input = event.target;
        const choice = input.value.trim();  // Get and trim the input value

        if (choice) {
            addChoice(field, choice);  // Add the choice as a tag
            input.value = '';  // Clear the input field
        }
    }
}

function prepareFormSubmission() {
    ['locale', 'scenario', 'intent', 'slots'].forEach(field => {
        const choicesContainer = document.getElementById(`${field}-choices`);

        // Collect selected values from the choice tags
        const selectedValues = Array.from(choicesContainer.children)
                                    .map(child => child.textContent.replace(' ✖', '').trim());

        // Only create a hidden input if it doesn’t already exist
        let hiddenInput = document.getElementById(`${field}-hidden`);
        if (!hiddenInput) {
            hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = field;
            hiddenInput.id = `${field}-hidden`;
            document.querySelector('form').appendChild(hiddenInput);
        }

        // Set the hidden input’s value as a JSON string of selected tags
        hiddenInput.value = JSON.stringify(selectedValues);
    });
}
