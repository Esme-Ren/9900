import random
import string
from django.core.mail import send_mail
from django.conf import settings

### Helper function to generate a random (6) digit verification code
def generate_verification_code(length=6, digits_only=True):
    if digits_only:
        alphabet = string.digits
    else:
        alphabet = string.ascii_letters + string.digits
    return ''.join(random.choices(alphabet, k=length))

### Helper function to send a verification email using SMTP 
def send_verification_email(email, code):
    subject = "Verify your account"
    message = f"Your verification code is: {code}\nThis code will expire in 5 minutes."
    from_email = settings.EMAIL_HOST_USER
    send_mail(subject, message, from_email, [email], fail_silently=False)

### Helper function to send a password reset email using SMTP
def send_password_reset_email(email, code):
    subject = "Password Reset Request"
    message = f"Your password reset code is: {code}\nThis code will expire in 15 minutes."
    from_email = settings.EMAIL_HOST_USER
    send_mail(subject, message, from_email, [email], fail_silently=False)
