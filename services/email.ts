export interface EmailProvider {
  sendEmail(input: { to: string; subject: string; html: string }): Promise<void>;
}

export class NoopEmailProvider implements EmailProvider {
  async sendEmail(): Promise<void> {
    return Promise.resolve();
  }
}

// Replace with ResendProvider or SendGridProvider when email delivery is enabled.
export function getEmailProvider(): EmailProvider {
  return new NoopEmailProvider();
}
