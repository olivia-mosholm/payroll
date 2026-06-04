import { useEffect, useState } from 'react';
import {
    Dialog,
    Tabs,
    Banner,
    Checkbox,
    Field,
    Input,
    Button,
    Badge,
    Icon,
    Switch,
    type Color,
} from '@economic/taco';
import type { Employee, EmployeeStatus } from '../../data/mockEmployees';
import { da } from '../../data/danishCopy';

type Props = {
    employee: Employee | null;
    onClose: () => void;
};

const STATUS_COLOR: Record<EmployeeStatus, Color> = {
    pending: 'orange',
    active: 'green',
    resigned: 'grey',
};

const STATUS_LABEL: Record<EmployeeStatus, string> = {
    pending: da.status.pending,
    active: da.status.active,
    resigned: da.status.resigned,
};

// --- Field primitives ---------------------------------------------------

function FieldLabel({
    children,
    required,
}: {
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <span className="text-xs font-bold text-neutral-900">
            {children}
            {required && ' *'}
        </span>
    );
}

function AiInput({
    aiExtracted,
    defaultValue,
    disabled,
    postfix,
}: {
    aiExtracted?: boolean;
    defaultValue?: string;
    disabled?: boolean;
    postfix?: React.ReactNode;
}) {
    return (
        <Input
            defaultValue={defaultValue ?? ''}
            disabled={disabled}
            aria-label={aiExtracted ? 'Udtrukket af AI' : undefined}
            postfix={postfix}
        />
    );
}

function SelectLike({
    defaultValue,
    disabled,
    placeholder,
}: {
    defaultValue?: string;
    disabled?: boolean;
    placeholder?: string;
}) {
    return (
        <Input
            defaultValue={defaultValue ?? ''}
            placeholder={placeholder}
            disabled={disabled}
            readOnly
            postfix={
                <span className="inline-flex items-center text-neutral-500 pointer-events-none">
                    <Icon name="chevron-down" />
                </span>
            }
        />
    );
}

function PercentInput({
    defaultValue,
    disabled,
}: {
    defaultValue?: string;
    disabled?: boolean;
}) {
    return (
        <Input
            defaultValue={defaultValue ?? ''}
            disabled={disabled}
            postfix={
                <span className="text-xs text-neutral-500 pl-1">%</span>
            }
        />
    );
}

function DateLike({
    defaultValue,
    disabled,
}: {
    defaultValue?: string;
    disabled?: boolean;
}) {
    return (
        <Input
            defaultValue={defaultValue ?? ''}
            disabled={disabled}
            postfix={
                <span className="inline-flex items-center text-neutral-500 pointer-events-none">
                    <Icon name="calendar" />
                </span>
            }
        />
    );
}

// --- Tab 1: Personlige oplysninger -------------------------------------

function PersonalInfoTab({ employee }: { employee: Employee | null }) {
    const t = da.editDialog;
    const f = t.fields;
    const extracted = {
        cpr: true,
        fullName: true,
        country: false,
        employeeGroup: false,
        employmentDate: true,
        employeeNumber: true,
        email: false,
        phone: false,
        postCode: false,
        city: false,
        address: false,
    };
    return (
        <div className="flex flex-col gap-4 pt-4">
            <h3 className="text-sm font-bold text-neutral-900">
                {t.sectionGeneral}
            </h3>
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
                {/* Column 1 */}
                <div className="flex flex-col gap-4">
                    <Field>
                        <FieldLabel required>{f.cpr}</FieldLabel>
                        <div className="flex gap-2 items-start">
                            <AiInput
                                aiExtracted={extracted.cpr}
                                defaultValue={employee?.cpr}
                            />
                            <Button appearance="default">{f.fetchCpr}</Button>
                        </div>
                    </Field>
                    <Field>
                        <FieldLabel required>{f.fullName}</FieldLabel>
                        <AiInput
                            aiExtracted={extracted.fullName}
                            defaultValue={employee?.name}
                        />
                    </Field>
                    <Field>
                        <FieldLabel>{f.co}</FieldLabel>
                        <AiInput />
                    </Field>
                    <div className="grid grid-cols-[110px_1fr] gap-2">
                        <Field>
                            <FieldLabel required>{f.postCode}</FieldLabel>
                            <AiInput
                                aiExtracted={extracted.postCode}
                                defaultValue={employee?.postCode}
                            />
                        </Field>
                        <Field>
                            <FieldLabel required>{f.city}</FieldLabel>
                            <AiInput
                                aiExtracted={extracted.city}
                                defaultValue={employee?.city}
                            />
                        </Field>
                    </div>
                    <Field>
                        <FieldLabel required>{f.address}</FieldLabel>
                        <AiInput
                            aiExtracted={extracted.address}
                            defaultValue={employee?.address}
                        />
                    </Field>
                </div>

                {/* Column 2 */}
                <div className="flex flex-col gap-4">
                    <Field>
                        <FieldLabel required>{f.country}</FieldLabel>
                        <SelectLike defaultValue={t.defaults.country} />
                    </Field>
                    <Field>
                        <FieldLabel>{f.email}</FieldLabel>
                        <AiInput
                            aiExtracted={extracted.email}
                            defaultValue={employee?.email}
                        />
                    </Field>
                    <Field>
                        <FieldLabel>{f.phone}</FieldLabel>
                        <div className="grid grid-cols-[80px_1fr] gap-2">
                            <SelectLike />
                            <AiInput
                                aiExtracted={extracted.phone}
                                defaultValue={employee?.phone}
                            />
                        </div>
                    </Field>
                </div>

                {/* Column 3 */}
                <div className="flex flex-col gap-4">
                    <Field>
                        <FieldLabel>{f.employeeGroup}</FieldLabel>
                        <SelectLike defaultValue="Ingen" />
                    </Field>
                    <div className="grid grid-cols-[1fr_1fr] gap-2">
                        <Field>
                            <FieldLabel required>{f.employmentDate}</FieldLabel>
                            <DateLike defaultValue={employee?.hireDate} />
                        </Field>
                        <Field>
                            <FieldLabel required>{f.employeeNumber}</FieldLabel>
                            <AiInput
                                aiExtracted={extracted.employeeNumber}
                                defaultValue={employee?.employeeNumber}
                            />
                        </Field>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Tab 2: Ansættelsesoplysninger -------------------------------------

function EmploymentTab() {
    return (
        <div className="flex flex-col gap-5 pt-4">
            <Banner state="warning">
                <div className="flex flex-col gap-1">
                    <strong>Afventer skattekort</strong>
                    <p className="mb-0">
                        Vi har endnu ikke modtaget et e-skattekort fra SKAT. Der
                        kan gå op til en hverdag før skattekortet modtages.
                    </p>
                </div>
            </Banner>

            <div className="grid grid-cols-[2fr_1fr] gap-x-8">
                {/* Løn section */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-neutral-900">Løn</h3>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                        <Field>
                            <FieldLabel required>Indkomsttype</FieldLabel>
                            <SelectLike defaultValue="Normal (A-indkomsttype)" />
                        </Field>
                        <Field>
                            <FieldLabel required>Løntermin</FieldLabel>
                            <SelectLike defaultValue="Månedslønnede, forud" />
                        </Field>
                        <Field>
                            <FieldLabel required>Skattekort</FieldLabel>
                            <SelectLike />
                        </Field>
                        <Field>
                            <FieldLabel>Trækprocent</FieldLabel>
                            <PercentInput defaultValue="0" disabled />
                        </Field>
                        <Field>
                            <FieldLabel required>ATP bidrag</FieldLabel>
                            <SelectLike defaultValue="Mindst 117 timer pr. måned (A-bidrag)" />
                        </Field>
                        <div />
                        <Field>
                            <FieldLabel>Ekstra trækprocent</FieldLabel>
                            <PercentInput defaultValue="0" />
                        </Field>
                        <Field>
                            <FieldLabel>Gældende fra</FieldLabel>
                            <DateLike disabled />
                        </Field>
                        <Field>
                            <FieldLabel>Bogføringsgruppe</FieldLabel>
                            <SelectLike />
                        </Field>
                        <Field>
                            <FieldLabel>Produktionsenhedsnummer</FieldLabel>
                            <Input defaultValue="" />
                        </Field>
                    </div>
                </div>

                {/* Udbetaling section */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-sm font-bold text-neutral-900">
                        Udbetaling
                    </h3>
                    <Field>
                        <FieldLabel>Udbetaling via</FieldLabel>
                        <SelectLike defaultValue="Konto nr." />
                    </Field>
                    <Field>
                        <FieldLabel required>Registreringsnr.</FieldLabel>
                        <Input defaultValue="" />
                    </Field>
                    <Field>
                        <FieldLabel required>Konto nr.</FieldLabel>
                        <Input defaultValue="" />
                    </Field>
                    <div className="flex flex-col gap-2">
                        <FieldLabel>Modtag lønbilag via</FieldLabel>
                        <div className="flex gap-4">
                            <label className="inline-flex items-center gap-2 text-sm">
                                <Checkbox defaultChecked />
                                <span>mit.dk</span>
                            </label>
                            <label className="inline-flex items-center gap-2 text-sm">
                                <Checkbox />
                                <span>e-Boks</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// --- Tab 3: Ferie ------------------------------------------------------

function VacationTab() {
    const [scheme, setScheme] = useState<'paid' | 'allowance' | 'none'>(
        'paid',
    );
    const [useAccount, setUseAccount] = useState(false);
    const [usePublicHoliday, setUsePublicHoliday] = useState(false);
    const [bigPrayerDay, setBigPrayerDay] = useState(true);
    return (
        <div className="flex flex-col gap-5 pt-4">
            {/* Top row: scheme picker + lock notice */}
            <div className="grid grid-cols-[2fr_1fr] gap-4">
                <div className="rounded-lg bg-blue-50 px-5 py-4 flex items-center gap-6 flex-wrap">
                    <span className="text-sm font-bold text-neutral-900">
                        Ferieordning:
                    </span>
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input
                            type="radio"
                            name="vacation-scheme"
                            checked={scheme === 'paid'}
                            onChange={() => setScheme('paid')}
                            className="accent-blue-500"
                        />
                        <span>Løn under ferie</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input
                            type="radio"
                            name="vacation-scheme"
                            checked={scheme === 'allowance'}
                            onChange={() => setScheme('allowance')}
                            className="accent-blue-500"
                        />
                        <span>Feriegodtgørelse</span>
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input
                            type="radio"
                            name="vacation-scheme"
                            checked={scheme === 'none'}
                            onChange={() => setScheme('none')}
                            className="accent-blue-500"
                        />
                        <span>Ingen ferie</span>
                    </label>
                </div>
                <div className="rounded-lg bg-blue-50 px-4 py-3 flex items-start gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white shrink-0 mt-0.5 text-xs">
                        i
                    </span>
                    <p className="text-xs text-neutral-700 mb-0">
                        Når en medarbejders første løn er blevet behandlet, kan
                        deres ferieordning ikke længere ændres
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-x-6 gap-y-4">
                {/* Column 1: always-on holiday fields */}
                <div className="flex flex-col gap-4">
                    <Field>
                        <FieldLabel required>Feriepenge</FieldLabel>
                        <PercentInput defaultValue="12,50" />
                    </Field>
                    <Field>
                        <FieldLabel required>Ferietillæg</FieldLabel>
                        <PercentInput defaultValue="1,00" />
                    </Field>
                    <Field>
                        <FieldLabel required>Optjening af feriedage</FieldLabel>
                        <SelectLike defaultValue="Fast hver måned" />
                    </Field>
                    <Field>
                        <FieldLabel required>Feriedage beregnes fra</FieldLabel>
                        <DateLike defaultValue="01.06.26" />
                    </Field>
                    <label className="inline-flex items-center gap-2 text-sm">
                        <Switch />
                        <span className="text-neutral-900">
                            Ferieuge beregnes med 6 dage
                        </span>
                    </label>
                </div>

                {/* Column 2: Benyt ferieregnskab */}
                <div className="flex flex-col gap-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={useAccount}
                            onChange={(e) =>
                                setUseAccount(
                                    (e.target as HTMLInputElement).checked,
                                )
                            }
                        />
                        <span className="font-bold text-neutral-900">
                            Benyt ferieregnskab
                        </span>
                    </label>
                    <div
                        className={`flex flex-col gap-3 ${
                            useAccount ? '' : 'opacity-50 pointer-events-none'
                        }`}
                    >
                        <label className="inline-flex items-start gap-2 text-xs text-neutral-700">
                            <Checkbox disabled={!useAccount} />
                            <span>Reducér feriepengegrundlag ved ferie</span>
                        </label>
                        <label className="inline-flex items-start gap-2 text-xs text-neutral-700">
                            <Checkbox disabled={!useAccount} />
                            <span>
                                Ekstra feriedage ud over de lovpligtige
                            </span>
                        </label>
                        <Field>
                            <FieldLabel>Ekstra feriedage pr. år</FieldLabel>
                            <Input
                                defaultValue="0"
                                disabled={!useAccount}
                                postfix={
                                    <span className="text-xs text-neutral-500">
                                        Dage
                                    </span>
                                }
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Tildelingstidspunkt</FieldLabel>
                            <SelectLike
                                defaultValue="Ingen"
                                disabled={!useAccount}
                            />
                        </Field>
                        <Field>
                            <FieldLabel>Afholdes af ekstra feriedage</FieldLabel>
                            <SelectLike
                                defaultValue="Efter lovpligtige ferier"
                                disabled={!useAccount}
                            />
                        </Field>
                    </div>
                </div>

                {/* Column 3: Søgnehelligdagsopsparing */}
                <div className="flex flex-col gap-3">
                    <label className="inline-flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={usePublicHoliday}
                            onChange={(e) =>
                                setUsePublicHoliday(
                                    (e.target as HTMLInputElement).checked,
                                )
                            }
                        />
                        <span className="font-bold text-neutral-900">
                            Søgnehelligdagsopsparing
                        </span>
                    </label>
                    <div
                        className={`flex flex-col gap-3 ${
                            usePublicHoliday
                                ? ''
                                : 'opacity-50 pointer-events-none'
                        }`}
                    >
                        <Field>
                            <FieldLabel>Procent</FieldLabel>
                            <PercentInput
                                defaultValue="0,00"
                                disabled={!usePublicHoliday}
                            />
                        </Field>
                        <Field>
                            <FieldLabel required>
                                Søgnehelligdagsmodtager
                            </FieldLabel>
                            <SelectLike disabled={!usePublicHoliday} />
                        </Field>
                        <Field>
                            <FieldLabel required>
                                Søgnehelligdage anvises
                            </FieldLabel>
                            <SelectLike
                                defaultValue="Ingen"
                                disabled={!usePublicHoliday}
                            />
                        </Field>
                        <label className="inline-flex items-center gap-2 text-xs">
                            <Switch disabled={!usePublicHoliday} />
                            <span className="text-neutral-700">
                                Restbeløb udbetales ved årsskifte
                            </span>
                        </label>
                    </div>
                </div>

                {/* Column 4: Store bededagstillæg + extras */}
                <div className="flex flex-col gap-4">
                    <label className="inline-flex items-center gap-2 text-sm">
                        <Checkbox
                            checked={bigPrayerDay}
                            onChange={(e) =>
                                setBigPrayerDay(
                                    (e.target as HTMLInputElement).checked,
                                )
                            }
                        />
                        <span className="font-bold text-neutral-900">
                            Store bededagstillæg
                        </span>
                    </label>
                    <Field>
                        <FieldLabel>Feriefridagsordning</FieldLabel>
                        <SelectLike defaultValue="Ingen" />
                    </Field>
                    <Field>
                        <FieldLabel>Fritvalgsopsparing</FieldLabel>
                        <PercentInput />
                    </Field>
                </div>
            </div>
        </div>
    );
}

// --- Tab 4: Lønoplysninger ---------------------------------------------

function SalaryTab() {
    return (
        <div className="flex flex-col gap-5 pt-4">
            <p className="text-sm text-neutral-700 mb-0">
                Her kan du tilføje lønoplysninger, som skal indgå fast i
                medarbejderens løn. Lønelene vil automatisk blive tilføjet i
                lønindbetalingen.
            </p>
            <div className="flex items-center gap-3">
                <Button appearance="default">
                    <Icon name="circle-plus" />
                    Tilføj løndel
                </Button>
                <div className="flex flex-col gap-1">
                    <FieldLabel>
                        Vælg udbetalingsdato for automatisk løn{' '}
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-500 text-white text-[10px] ml-1">
                            i
                        </span>
                    </FieldLabel>
                    <div className="w-32">
                        <SelectLike defaultValue="31" disabled />
                    </div>
                </div>
            </div>
            <ul className="flex flex-col gap-2">
                <li className="flex items-center justify-between px-4 py-3 bg-white border border-grey-300 rounded-lg">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-neutral-900">
                            0001 Arbejdstimer
                        </span>
                        <span className="text-xs text-neutral-500">
                            0,00 Hours
                        </span>
                    </div>
                    <Icon name="chevron-down" />
                </li>
            </ul>
        </div>
    );
}

// --- Tab 5: Pension ----------------------------------------------------

function PensionTab() {
    return (
        <div className="flex flex-col gap-5 pt-4">
            <p className="text-sm text-neutral-700 mb-0">
                Hvis medarbejderen skal have pension, skal pensionsoplysningerne
                registreres på den enkelte medarbejder og pensionen vil dermed
                blive beregnet i forbindelse med lønindberetningen. Husk at
                anvende de korrekte løndele, når du udbetaler løn for at
                pensionen bliver beregnet korrekt.
            </p>
            <div>
                <Button appearance="default">
                    <Icon name="circle-plus" />
                    Tilføj pensionsordning
                </Button>
            </div>
        </div>
    );
}

// --- Placeholder tabs --------------------------------------------------

function TabPlaceholder() {
    return (
        <div className="py-12 text-sm text-neutral-500 text-center">
            {da.editDialog.tabPlaceholder}
        </div>
    );
}

// --- Dialog -----------------------------------------------------------

// Ordered list of tab IDs so the "Gem" button can advance to the next one.
const TAB_ORDER = [
    'personal-info',
    'employment',
    'vacation',
    'salary',
    'pension',
    'options',
    'statistics',
    'registration',
];

export function EmployeeEditDialogV2({ employee, onClose }: Props) {
    const open = !!employee;
    const t = da.editDialog;
    const [activeTab, setActiveTab] = useState(TAB_ORDER[0]);

    // Reset to the first tab each time the dialog re-opens (or switches to
    // a different employee). Otherwise the user would re-open and land on
    // whatever tab they last advanced to.
    useEffect(() => {
        if (open) setActiveTab(TAB_ORDER[0]);
    }, [open, employee?.id]);

    const handleSave = () => {
        const i = TAB_ORDER.indexOf(activeTab);
        if (i >= 0 && i < TAB_ORDER.length - 1) {
            setActiveTab(TAB_ORDER[i + 1]);
        } else {
            // Last tab — Gem closes.
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onChange={(next) => {
                if (!next) onClose();
            }}
            size="lg"
        >
            <Dialog.Content aria-label={employee?.name ?? 'Edit employee'}>
                <Dialog.Title>
                    <span className="inline-flex items-center gap-2">
                        <span>{employee?.name ?? ''}</span>
                        {employee && (
                            <Badge color={STATUS_COLOR[employee.status]} subtle>
                                {STATUS_LABEL[employee.status]}
                            </Badge>
                        )}
                    </span>
                </Dialog.Title>

                <Tabs id={activeTab} onChange={setActiveTab}>
                    <Tabs.List>
                        <Tabs.Trigger id="personal-info">
                            {t.tabs.personalInfo}
                        </Tabs.Trigger>
                        <Tabs.Trigger id="employment">
                            {t.tabs.employment}
                        </Tabs.Trigger>
                        <Tabs.Trigger id="vacation">
                            {t.tabs.vacation}
                        </Tabs.Trigger>
                        <Tabs.Trigger id="salary">{t.tabs.salary}</Tabs.Trigger>
                        <Tabs.Trigger id="pension">{t.tabs.pension}</Tabs.Trigger>
                        <Tabs.Trigger id="options">{t.tabs.options}</Tabs.Trigger>
                        <Tabs.Trigger id="statistics">
                            {t.tabs.statistics}
                        </Tabs.Trigger>
                        <Tabs.Trigger id="registration">
                            {t.tabs.registration}
                        </Tabs.Trigger>
                    </Tabs.List>

                    <Tabs.Content id="personal-info">
                        <PersonalInfoTab employee={employee} />
                    </Tabs.Content>
                    <Tabs.Content id="employment">
                        <EmploymentTab />
                    </Tabs.Content>
                    <Tabs.Content id="vacation">
                        <VacationTab />
                    </Tabs.Content>
                    <Tabs.Content id="salary">
                        <SalaryTab />
                    </Tabs.Content>
                    <Tabs.Content id="pension">
                        <PensionTab />
                    </Tabs.Content>
                    <Tabs.Content id="options">
                        <TabPlaceholder />
                    </Tabs.Content>
                    <Tabs.Content id="statistics">
                        <TabPlaceholder />
                    </Tabs.Content>
                    <Tabs.Content id="registration">
                        <TabPlaceholder />
                    </Tabs.Content>
                </Tabs>

                <Dialog.Footer>
                    <div className="flex items-center gap-2">
                        <Button appearance="default" onClick={onClose}>
                            {t.actions.cancel}
                        </Button>
                        <Button appearance="primary" onClick={handleSave}>
                            {t.actions.save}
                        </Button>
                        <Button appearance="default" onClick={onClose}>
                            {t.actions.saveNext}
                        </Button>
                    </div>
                </Dialog.Footer>
            </Dialog.Content>
        </Dialog>
    );
}
