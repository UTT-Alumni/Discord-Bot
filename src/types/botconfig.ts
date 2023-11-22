export type BotConfig = {
    server: string;
    channel: string;
    accept: string;
    rules: string;
    modal: {
        title: string;
        firstNameLabel: string;
        firstNamePlaceholder: string;
        familyNameLabel: string;
        familyNamePlaceholder: string;
        graduationYearLabel: string;
        graduationYearPlaceholder: string;
        educationLabel: string;
        educationPlaceholder: string;
    };
    role: string;
    welcome: string;
    error: string;
    token: string;
};