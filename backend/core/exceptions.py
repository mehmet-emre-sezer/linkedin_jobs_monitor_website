"""Uygulama genelinde kullanılan domain hata sınıfları."""


class DomainError(Exception):
    """Tüm domain hatalarının temel sınıfı."""


class EmailAlreadyExistsError(DomainError):
    """Bu email zaten kayıtlı."""


class InvalidCredentialsError(DomainError):
    """Email veya şifre yanlış."""


class UserNotFoundError(DomainError):
    """Kullanıcı bulunamadı."""


class InvalidFileTypeError(DomainError):
    """Geçersiz dosya tipi."""


class FileTooLargeError(DomainError):
    """Dosya boyutu limiti aştı."""
