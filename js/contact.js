
document.addEventListener('DOMContentLoaded', () => {
    
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const contactData = {
                name: document.getElementById('name').value.trim(),
                lastName: document.getElementById('lastName').value.trim(),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                matter: document.getElementById('matter').value.trim(),
                message: document.getElementById('message').value.trim()
            };

            try {
                
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Enviando...';

                await submitContactForm(contactData);
                
                showMessage('¡Mensaje enviado con éxito! Te contactaremos pronto.', 'success');
                contactForm.reset();
                
            } catch (error) {
                console.error('Error en contacto:', error);
                showMessage('Hubo un problema al enviar el mensaje. Reintentá en unos minutos.', 'error');
            } finally {
                const submitBtn = contactForm.querySelector('button[type="submit"]');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Enviar Mensaje 🚀';
            }
        });
    }
});