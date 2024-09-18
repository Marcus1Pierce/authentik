import "@goauthentik/components/ak-wizard/ak-wizard-steps.js";
import { WizardUpdateEvent } from "@goauthentik/components/ak-wizard/events";
import { AKElement } from "@goauthentik/elements/Base.js";
import { bound } from "@goauthentik/elements/decorators/bound";

import { html } from "lit";
import { customElement, state } from "lit/decorators.js";

import "./steps/ak-application-wizard-application-step.js";
import "./steps/ak-application-wizard-provider-choice-step.js";
import "./steps/ak-application-wizard-provider-step.js";
import "./steps/ak-application-wizard-submit-step.js";
import { type ApplicationWizardState, type ApplicationWizardStateUpdate } from "./types";

const asArr = <T>(v: T | T[]): T[] => (Array.isArray(v) ? v : [v]);

const freshWizardState = (): ApplicationWizardState => ({
    providerModel: "",
    currentBinding: -1,
    app: {},
    provider: {},
    errors: {},
    bindings: [],
});

@customElement("ak-application-wizard-main")
export class AkApplicationWizardMain extends AKElement {
    @state()
    wizard: ApplicationWizardState = freshWizardState();

    @state()
    enabled: Set<string> = new Set(["application"]);

    constructor() {
        super();
        this.addEventListener(WizardUpdateEvent.eventName, this.handleUpdate);
    }

    @bound
    handleUpdate(ev: WizardUpdateEvent<ApplicationWizardStateUpdate>) {
        ev.stopPropagation();
        const { update, status } = ev.content;
        if (update !== undefined) {
            this.wizard = {
                ...this.wizard,
                ...update,
            };
        }
        if (status !== undefined) {
            const enable = asArr(status.enable ?? []);
            const disable = asArr(status.disable ?? []);
            this.enabled = new Set([
                ...Array.from(this.enabled.keys()).filter((k: string) => !disable.includes(k)),
                ...enable,
            ]);
        }
    }

    render() {
        return html`<ak-wizard-steps .enabled=${Array.from(this.enabled.keys())}>
            <ak-application-wizard-application-step
                slot="application"
                .wizard=${this.wizard}
            ></ak-application-wizard-application-step>
            <ak-application-wizard-provider-choice-step
                slot="provider-choice"
                .wizard=${this.wizard}
            ></ak-application-wizard-provider-choice-step>
            <ak-application-wizard-provider-step
                slot="provider"
                .wizard=${this.wizard}
            ></ak-application-wizard-provider-step>
            <ak-application-wizard-submit-step
                slot="submit"
                .wizard=${this.wizard}
            ></ak-application-wizard-submit-step>
        </ak-wizard-steps>`;
    }
}