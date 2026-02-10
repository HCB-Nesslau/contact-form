// Use relative path since frontend and backend are on the same Vercel domain
const API_ENDPOINT = '/api/submit';

document.getElementById('contactForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const messageDiv = document.getElementById('message');

    // Disable submit button and show loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Wird gesendet...';
    spinner.style.display = 'inline-block';
    messageDiv.style.display = 'none';
    messageDiv.className = 'message';

    // Collect form data
    const formData = {
        anrede: document.getElementById('anrede').value,
        name: document.getElementById('name').value,
        vorname: document.getElementById('vorname').value,
        adresse: document.getElementById('adresse').value,
        plz: document.getElementById('plz').value,
        ort: document.getElementById('ort').value,
        email: document.getElementById('email').value,
        tel: document.getElementById('tel').value || '',
        status: 'PM', // Always set to Passivmitglied
        betrag: document.getElementById('betrag').value,
        beitritt: new Date().getFullYear().toString(),
        referenz: document.getElementById('referenz').value || ''
    };

    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            // Success
            messageDiv.textContent = 'Vielen Dank! Ihre Anmeldung wurde erfolgreich übermittelt.';
            messageDiv.className = 'message success';
            messageDiv.style.display = 'block';

            // Reset form
            document.getElementById('contactForm').reset();
        } else {
            // Error from server
            throw new Error(result.error || 'Fehler beim Übermitteln der Daten');
        }
    } catch (error) {
        // Network or other error
        console.error('Error:', error);
        messageDiv.textContent = 'Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.';
        messageDiv.className = 'message error';
        messageDiv.style.display = 'block';
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        btnText.textContent = 'Anmeldung absenden';
        spinner.style.display = 'none';
    }
});

// Input validation helpers
document.getElementById('plz').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 4);
});

document.getElementById('betrag').addEventListener('input', function(e) {
    if (this.value < 0) {
        this.value = 0;
    }
});
