import {
    useEffect,
    useMemo,
    useState,
    type FormEvent,
    type ReactNode,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Tabs,
    Badge,
    Button,
    Alert,
    Banner,
    Heading,
    Icon,
    Input,
    Menu,
    type Color,
} from '@economic/taco';
import { updateEmployee, useEmployees } from '../store/employeesStore';
import type { Employee, EmployeeStatus } from '../data/mockEmployees';
import { da } from '../data/danishCopy';
import { useVariantPaths } from '../paths';

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

// --- Stat cards ----------------------------------------------------------

function StatCard({
    title,
    value,
    subtitle,
}: {
    title: string;
    value: string;
    subtitle?: string;
}) {
    return (
        <div className="flex-1 min-w-0 rounded-lg border border-grey-300 bg-white px-4 py-3">
            <p className="text-xs font-bold text-neutral-900 mb-1.5 mt-0">
                {title}
            </p>
            <p className="text-2xl font-normal text-neutral-900 leading-tight truncate mb-0 mt-0">
                {value}
            </p>
            {subtitle && (
                <p className="text-xs text-neutral-500 mt-1 mb-0">{subtitle}</p>
            )}
        </div>
    );
}

function GrossYtdCard() {
    const s = da.detailPage.stats;
    return (
        <div className="flex-1 min-w-0 rounded-lg border-2 border-blue-500 bg-white px-4 py-3">
            <p className="text-xs font-bold text-neutral-900 mb-1.5 mt-0">
                {s.grossYtd}
            </p>
            <p className="text-2xl font-normal text-blue-500 leading-tight truncate mb-0 mt-0">
                0,00 {s.grossYtdCurrency}
            </p>
            <p className="text-xs text-neutral-500 mt-1 mb-0">
                {s.grossYtdTotal}
            </p>
        </div>
    );
}

// --- Read-only field display --------------------------------------------

function ReadOnlyField({
    label,
    value,
    required,
    highlight,
}: {
    label: string;
    value: string | undefined;
    required?: boolean;
    highlight?: boolean;
}) {
    const display = value && value.length > 0 ? value : 'n/a';
    const isMissing = !value;
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <dt className="text-xs font-bold text-neutral-900">
                {label}
                {required && '*'}
            </dt>
            <dd
                className={`flex items-center gap-1.5 min-w-0 text-sm leading-5 ${
                    isMissing && !highlight
                        ? 'text-neutral-500'
                        : 'text-neutral-900'
                }`}
            >
                <span className="truncate" title={display}>
                    {display}
                </span>
                {highlight && (
                    <span
                        className="inline-flex items-center text-blue-500 shrink-0"
                        title="Udtrukket af AI"
                        aria-label="Udtrukket af AI"
                    >
                        <Icon name="ai-stars" />
                    </span>
                )}
            </dd>
        </div>
    );
}

// --- Editable field (Input variant) ------------------------------------

function EditableField({
    name,
    label,
    defaultValue,
    required,
    highlight,
}: {
    name?: string;
    label: string;
    defaultValue?: string;
    required?: boolean;
    highlight?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1 min-w-0">
            <label className="text-xs font-bold text-neutral-900">
                {label}
                {required && '*'}
            </label>
            <Input
                name={name}
                defaultValue={defaultValue ?? ''}
                postfix={
                    highlight ? (
                        <span
                            className="inline-flex items-center text-blue-500"
                            title="Udtrukket af AI"
                            aria-label="Udtrukket af AI"
                        >
                            <Icon name="ai-stars" />
                        </span>
                    ) : undefined
                }
            />
        </div>
    );
}

// --- Section card with inline editing -----------------------------------
//
// Each card owns its own edit state. The body is rendered via a render-prop
// so the section can switch between read-only and editable variants of the
// same field list. Save is performed by reading the form data and applying
// it through the provided `onSave` callback — sections without persistable
// data can omit `onSave` and Gem just exits edit mode.

function SectionCard({
    id,
    title,
    renderBody,
    onSave,
    footer,
}: {
    id: string;
    title: string;
    renderBody: (isEditing: boolean) => ReactNode;
    onSave?: (formData: FormData) => void;
    footer?: ReactNode;
}) {
    const [isEditing, setIsEditing] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        onSave?.(data);
        setIsEditing(false);
    };

    const body = (
        <div className="px-5 pb-4 flex flex-col gap-3">
            <dl className="grid grid-cols-3 gap-x-6 gap-y-3">
                {renderBody(isEditing)}
            </dl>
            {footer}
        </div>
    );

    const header = (
        <header className="px-5 py-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">{title}</h2>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <Button
                        appearance="default"
                        type="button"
                        onClick={() => setIsEditing(false)}
                    >
                        {da.actions.cancel}
                    </Button>
                    <Button appearance="primary" type="submit">
                        {da.editDialog.actions.save}
                    </Button>
                </div>
            ) : (
                <Button
                    appearance="default"
                    onClick={() => setIsEditing(true)}
                >
                    {da.detailPage.edit}
                </Button>
            )}
        </header>
    );

    return (
        <section
            id={id}
            className="scroll-mt-24 rounded-lg border border-grey-300 bg-white"
        >
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    {header}
                    {body}
                </form>
            ) : (
                <>
                    {header}
                    {body}
                </>
            )}
        </section>
    );
}

// --- Section content ----------------------------------------------------
//
// Each section renders either ReadOnlyField (default) or EditableField
// (when the parent SectionCard is in edit mode). Field rendering is unified
// inside the renderField helper below.

function renderField(
    isEditing: boolean,
    args: {
        name?: string;
        label: string;
        value: string | undefined;
        required?: boolean;
        highlight?: boolean;
    },
) {
    if (isEditing) {
        return (
            <EditableField
                name={args.name}
                label={args.label}
                defaultValue={args.value}
                required={args.required}
                highlight={args.highlight}
            />
        );
    }
    return (
        <ReadOnlyField
            label={args.label}
            value={args.value}
            required={args.required}
            highlight={args.highlight}
        />
    );
}

function PersonalInfoSection({ employee }: { employee: Employee }) {
    const f = da.editDialog.fields;
    const enriched = employee.enriched ?? false;
    return (
        <SectionCard
            id="personoplysninger"
            title={da.detailPage.sections.personalInfo}
            onSave={(formData) => {
                const patch: Partial<Employee> = {};
                const set = (k: keyof Employee, v: FormDataEntryValue | null) => {
                    if (typeof v === 'string') {
                        (patch as Record<string, unknown>)[String(k)] = v;
                    }
                };
                set('cpr', formData.get('cpr'));
                set('name', formData.get('name'));
                set('hireDate', formData.get('hireDate'));
                set('employeeNumber', formData.get('employeeNumber'));
                set('email', formData.get('email'));
                set('phone', formData.get('phone'));
                set('address', formData.get('address'));
                set('postCode', formData.get('postCode'));
                set('city', formData.get('city'));
                updateEmployee(employee.id, patch);
            }}
            renderBody={(isEditing) => (
                <>
                    {/* Column 1 */}
                    {renderField(isEditing, {
                        name: 'cpr',
                        label: f.cpr,
                        value: employee.cpr,
                        required: true,
                    })}
                    {renderField(isEditing, {
                        name: 'country',
                        label: f.country,
                        value: da.editDialog.defaults.country,
                        required: true,
                    })}
                    {renderField(isEditing, {
                        name: 'employeeGroup',
                        label: f.employeeGroup,
                        value: da.editDialog.defaults.employeeGroup,
                    })}

                    {renderField(isEditing, {
                        name: 'name',
                        label: f.fullName,
                        value: employee.name,
                        required: true,
                    })}
                    {renderField(isEditing, {
                        name: 'tin',
                        label: da.detailPage.fieldLabels.tin,
                        value: undefined,
                    })}
                    <div className="grid grid-cols-2 gap-4">
                        {renderField(isEditing, {
                            name: 'hireDate',
                            label: f.employmentDate,
                            value: employee.hireDate,
                            required: true,
                            highlight: enriched,
                        })}
                        {renderField(isEditing, {
                            name: 'employeeNumber',
                            label: f.employeeNumber,
                            value: employee.employeeNumber,
                            required: true,
                            highlight: enriched,
                        })}
                    </div>

                    {renderField(isEditing, {
                        name: 'co',
                        label: f.co,
                        value: undefined,
                    })}
                    {renderField(isEditing, {
                        name: 'email',
                        label: f.email,
                        value: employee.email,
                        highlight: enriched && !!employee.email,
                    })}
                    <div />

                    <div className="grid grid-cols-[110px_1fr] gap-3">
                        {renderField(isEditing, {
                            name: 'postCode',
                            label: f.postCode,
                            value: employee.postCode,
                            required: true,
                            highlight: enriched && !!employee.postCode,
                        })}
                        {renderField(isEditing, {
                            name: 'city',
                            label: f.city,
                            value: employee.city,
                            required: true,
                            highlight: enriched && !!employee.city,
                        })}
                    </div>
                    {renderField(isEditing, {
                        name: 'phone',
                        label: f.phone,
                        value: employee.phone,
                        highlight: enriched && !!employee.phone,
                    })}
                    <div />

                    {renderField(isEditing, {
                        name: 'address',
                        label: f.address,
                        value: employee.address,
                        required: true,
                        highlight: enriched && !!employee.address,
                    })}
                </>
            )}
        />
    );
}

function PaymentSection({ employee }: { employee: Employee }) {
    const t = da.detailPage.payment;
    return (
        <section
            id="lonudbetaling"
            className="scroll-mt-24 rounded-lg border border-grey-300 bg-white"
        >
            <PaymentBody employee={employee} t={t} />
        </section>
    );
}

function PaymentBody({
    employee,
    t,
}: {
    employee: Employee;
    t: typeof da.detailPage.payment;
}) {
    const [isEditing, setIsEditing] = useState(false);
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsEditing(false);
    };

    const body = (
        <div className="px-5 pb-4">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                {renderField(isEditing, {
                    name: 'bankReg',
                    label: t.bankReg,
                    value: undefined,
                })}
                {renderField(isEditing, {
                    name: 'bankAccount',
                    label: t.bankAccount,
                    value: undefined,
                })}
                {renderField(isEditing, {
                    name: 'payoutMethod',
                    label: t.payoutMethod,
                    value: t.payoutMethodValue,
                })}
                {renderField(isEditing, {
                    name: 'payFrequency',
                    label: t.payFrequency,
                    value: employee.payPeriod || t.payFrequencyValue,
                })}
                {renderField(isEditing, {
                    name: 'iban',
                    label: t.iban,
                    value: undefined,
                })}
                {renderField(isEditing, {
                    name: 'bicSwift',
                    label: t.bicSwift,
                    value: undefined,
                })}
            </dl>
        </div>
    );

    const header = (
        <header className="px-5 py-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">
                {da.detailPage.sections.payment}
            </h2>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <Button
                        appearance="default"
                        type="button"
                        onClick={() => setIsEditing(false)}
                    >
                        {da.actions.cancel}
                    </Button>
                    <Button appearance="primary" type="submit">
                        {da.editDialog.actions.save}
                    </Button>
                </div>
            ) : (
                <Button
                    appearance="default"
                    onClick={() => setIsEditing(true)}
                >
                    {da.detailPage.edit}
                </Button>
            )}
        </header>
    );

    return isEditing ? (
        <form onSubmit={handleSubmit}>
            {header}
            {body}
        </form>
    ) : (
        <>
            {header}
            {body}
        </>
    );
}

function TaxCardSection() {
    const t = da.detailPage.taxCard;
    const [isEditing, setIsEditing] = useState(false);
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsEditing(false);
    };

    const body = (
        <div className="px-5 pb-4 flex flex-col gap-3">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
                {renderField(isEditing, {
                    name: 'cardType',
                    label: t.cardType,
                    value: undefined,
                })}
                {renderField(isEditing, {
                    name: 'aTaxPercent',
                    label: t.aTaxPercent,
                    value: undefined,
                })}
                {renderField(isEditing, {
                    name: 'amContribution',
                    label: t.amContributionPercent,
                    value: '8 %',
                })}
                {renderField(isEditing, {
                    name: 'taxFreeAllowance',
                    label: t.taxFreeAllowance,
                    value: undefined,
                })}
                {renderField(isEditing, {
                    name: 'taxDebt',
                    label: t.taxDebt,
                    value: undefined,
                })}
            </dl>
            <Banner state="warning">
                <div className="flex flex-col gap-1">
                    <strong>{t.missingTitle}</strong>
                    <p className="mb-0">{t.missingBody}</p>
                </div>
            </Banner>
        </div>
    );

    const header = (
        <header className="px-5 py-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">
                {da.detailPage.sections.taxCard}
            </h2>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <Button
                        appearance="default"
                        type="button"
                        onClick={() => setIsEditing(false)}
                    >
                        {da.actions.cancel}
                    </Button>
                    <Button appearance="primary" type="submit">
                        {da.editDialog.actions.save}
                    </Button>
                </div>
            ) : (
                <Button
                    appearance="default"
                    onClick={() => setIsEditing(true)}
                >
                    {da.detailPage.edit}
                </Button>
            )}
        </header>
    );

    return (
        <section
            id="skattekort"
            className="scroll-mt-24 rounded-lg border border-grey-300 bg-white"
        >
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    {header}
                    {body}
                </form>
            ) : (
                <>
                    {header}
                    {body}
                </>
            )}
        </section>
    );
}

function HolidaySection() {
    const t = da.detailPage.holiday;
    const [isEditing, setIsEditing] = useState(false);
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsEditing(false);
    };

    const body = (
        <div className="px-5 pb-4">
            <dl className="grid grid-cols-3 gap-x-6 gap-y-3">
                {renderField(isEditing, {
                    name: 'scheme',
                    label: t.scheme,
                    value: t.schemeValue,
                })}
                {renderField(isEditing, {
                    name: 'statutory',
                    label: t.statutory,
                    value: '25 dage',
                })}
                {renderField(isEditing, {
                    name: 'extra',
                    label: t.extra,
                    value: '5 dage',
                })}
                {renderField(isEditing, {
                    name: 'transferred',
                    label: t.transferred,
                    value: undefined,
                })}
                {renderField(isEditing, {
                    name: 'vacationFund',
                    label: t.vacationFund,
                    value: 'FerieKonto',
                })}
            </dl>
        </div>
    );

    const header = (
        <header className="px-5 py-3 flex items-center justify-between">
            <h2 className="text-base font-bold text-neutral-900">
                {da.detailPage.sections.holiday}
            </h2>
            {isEditing ? (
                <div className="flex items-center gap-2">
                    <Button
                        appearance="default"
                        type="button"
                        onClick={() => setIsEditing(false)}
                    >
                        {da.actions.cancel}
                    </Button>
                    <Button appearance="primary" type="submit">
                        {da.editDialog.actions.save}
                    </Button>
                </div>
            ) : (
                <Button
                    appearance="default"
                    onClick={() => setIsEditing(true)}
                >
                    {da.detailPage.edit}
                </Button>
            )}
        </header>
    );

    return (
        <section
            id="ferie"
            className="scroll-mt-24 rounded-lg border border-grey-300 bg-white"
        >
            {isEditing ? (
                <form onSubmit={handleSubmit}>
                    {header}
                    {body}
                </form>
            ) : (
                <>
                    {header}
                    {body}
                </>
            )}
        </section>
    );
}

// --- Anchor navigation --------------------------------------------------

type SectionMeta = { id: string; label: string };

function AnchorNav({
    sections,
    activeId,
    onJump,
}: {
    sections: SectionMeta[];
    activeId: string;
    onJump: (id: string) => void;
}) {
    return (
        <nav
            aria-label="Sektionsnavigation"
            className="sticky top-6 flex flex-col gap-px"
        >
            {sections.map((s) => {
                const active = s.id === activeId;
                return (
                    <a
                        key={s.id}
                        href={`#${s.id}`}
                        onClick={(e) => {
                            e.preventDefault();
                            onJump(s.id);
                        }}
                        className={`pl-3 py-1.5 text-sm border-l-2 transition-colors ${
                            active
                                ? 'border-blue-500 text-blue-500 font-bold'
                                : 'border-grey-300 text-neutral-700 hover:text-neutral-900'
                        }`}
                    >
                        {s.label}
                    </a>
                );
            })}
        </nav>
    );
}

// --- Existing legacy tab content (preserved) ----------------------------

function YearToggle() {
    return (
        <div className="inline-flex items-center gap-1 bg-neutral-100 rounded p-0.5">
            <button
                type="button"
                className="text-sm px-3 py-1 rounded bg-white border border-neutral-300 font-bold"
            >
                {da.detailPage.currentYear}
            </button>
            <button
                type="button"
                className="text-sm px-3 py-1 rounded text-neutral-700 hover:bg-white"
            >
                {da.detailPage.previousYear}
            </button>
        </div>
    );
}

function BalancesTab() {
    const t = da.detailPage.balances;
    const rows: Array<{ no?: string; item: string; amount: string }> = [
        { item: t.rows.gross, amount: '0,00 DKK' },
        { no: '13', item: t.rows.amYes, amount: '0,00' },
        { no: '14', item: t.rows.amNo, amount: '0,00' },
        { no: '15', item: t.rows.aTax, amount: '0,00' },
        { no: '16', item: t.rows.amContribution, amount: '0,00' },
        { no: '19', item: t.rows.freeCar, amount: '0,00' },
        { no: '20', item: t.rows.multimedia, amount: '0,00' },
        { no: '21', item: t.rows.freeFoodLodging, amount: '0,00' },
        { no: '26', item: 'Værdi af arbejdsgiverbetalt sundhedsforsikring', amount: '0,00' },
        { no: '36', item: 'B-indkomst, der skal betales AM-bidrag', amount: '0,00' },
        { no: '38', item: 'B-indkomst, der ikke skal betales AM-bidrag', amount: '0,00' },
        { no: '46', item: 'ATP i alt', amount: '0,00' },
        { no: '48', item: 'Skattefri rejse- og befordringsgodtgørelse, samt skattefri uddannelsesydelse', amount: '0,00' },
        { no: '50', item: 'Værdi af fri helårsbolig', amount: '0,00' },
        { no: '51', item: 'Værdi af fri sommerbolig', amount: '0,00' },
        { no: '52', item: 'Værdi af fri lystbåd', amount: '0,00' },
        { no: '53', item: 'Værdi af fri medie-/radiolicense', amount: '0,00' },
        { no: '55', item: 'Værdi af andre personalegoder', amount: '0,00' },
        { no: '56', item: 'Værdi af personalegoder, ikke omfattet af bagatelgrænse', amount: '0,00' },
        { no: '69', item: 'Jubilæumsgratiale og fratrædelsesgodtgørelse', amount: '0,00' },
        { no: '70', item: 'Del af jubilæumsgratiale og fratrædelsesgodtgørelse, som er indbetalt til virksomheds administreret pension', amount: '0,00' },
        { no: '71', item: 'Del af Jubilæumsgratiale og fratrædelsesgodtgørelse, som er tingsgave', amount: '0,00' },
        { no: '83', item: 'Søndage', amount: '0,00' },
    ];
    return (
        <div className="flex flex-col gap-4 pt-4">
            <YearToggle />
            <div className="rounded-lg border border-grey-300 bg-white">
                <header className="px-6 py-4">
                    <h2 className="text-base font-bold text-neutral-900">
                        {t.sectionTitle}
                    </h2>
                </header>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-700 border-b border-grey-300">
                            <th className="font-bold px-6 py-3 w-20">{t.colNo}</th>
                            <th className="font-bold px-6 py-3">{t.colItem}</th>
                            <th className="font-bold px-6 py-3 text-right">
                                {t.colAmount}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr
                                key={i}
                                className="border-b border-grey-200 last:border-b-0"
                            >
                                <td className="px-6 py-3 text-neutral-700">
                                    {row.no ?? ''}
                                </td>
                                <td className="px-6 py-3 text-neutral-900">
                                    {row.item}
                                </td>
                                <td className="px-6 py-3 text-right text-neutral-900">
                                    {row.amount}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function VacationSavingsTab() {
    const v = da.detailPage.vacation;
    const days = [
        {
            type: v.statutory,
            period: '01.09.25 - 31.08.26',
            earned: '0,00',
            taken: '0,00',
            rest: '0,00',
        },
        {
            type: v.statutory,
            period: '01.09.24 - 31.08.25',
            earned: '0,00',
            taken: '0,00',
            rest: '0,00',
        },
        {
            type: v.transferred,
            period: '',
            earned: '0,00',
            taken: '0,00',
            rest: '0,00',
        },
    ];
    return (
        <div className="flex flex-col gap-6 pt-4">
            <div className="rounded-lg border border-grey-300 bg-white">
                <header className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-base font-bold text-neutral-900">
                        {v.sectionTitle}
                    </h2>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
                    >
                        <Icon name="edit" />
                        {da.detailPage.edit}
                    </button>
                </header>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-700 border-b border-grey-300">
                            <th className="font-bold px-6 py-3 w-32">{v.colType}</th>
                            <th className="font-bold px-6 py-3">
                                {v.colAccrualPeriod}
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-24">
                                {v.colEarned}
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-24">
                                {v.colTaken}
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-24">
                                {v.colRemaining}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {days.map((d, i) => (
                            <tr
                                key={i}
                                className="border-b border-grey-200"
                            >
                                <td className="px-6 py-3 text-neutral-900">
                                    {d.type}
                                </td>
                                <td className="px-6 py-3 text-neutral-700">
                                    {d.period}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    {d.earned}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    {d.taken}
                                </td>
                                <td className="px-6 py-3 text-right">
                                    {d.rest}
                                </td>
                            </tr>
                        ))}
                        <tr className="font-bold">
                            <td className="px-6 py-3">{v.total}</td>
                            <td className="px-6 py-3"></td>
                            <td className="px-6 py-3 text-right">0,00</td>
                            <td className="px-6 py-3 text-right">0,00</td>
                            <td className="px-6 py-3 text-right">0,00</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="rounded-lg border border-grey-300 bg-white">
                <header className="flex items-center justify-between px-6 py-4">
                    <h2 className="text-base font-bold text-neutral-900">
                        {v.taxSectionTitle}
                    </h2>
                    <button
                        type="button"
                        className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline"
                    >
                        <Icon name="edit" />
                        {da.detailPage.edit}
                    </button>
                </header>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-neutral-700 border-b border-grey-300">
                            <th className="font-bold px-6 py-3">{v.taxColType}</th>
                            <th className="font-bold px-6 py-3 text-right w-48">
                                <div>{da.detailPage.currentYear}</div>
                                <div className="text-xs font-normal text-neutral-500">
                                    01.09.25-31.08.26
                                </div>
                            </th>
                            <th className="font-bold px-6 py-3 text-right w-48">
                                <div>{da.detailPage.previousYear}</div>
                                <div className="text-xs font-normal text-neutral-500">
                                    01.09.24-31.08.25
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-6 py-3">{v.taxBasis}</td>
                            <td className="px-6 py-3 text-right">0,00</td>
                            <td className="px-6 py-3 text-right">0,00 DKK</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function PayHistoryTab() {
    return (
        <div className="py-16 text-sm text-neutral-500 text-center">
            {da.editDialog.tabPlaceholder}
        </div>
    );
}

// --- Overview tab (the new stacked-cards layout) ------------------------

const SECTIONS: SectionMeta[] = [
    { id: 'personoplysninger', label: da.detailPage.sections.personalInfo },
    { id: 'lonudbetaling', label: da.detailPage.sections.payment },
    { id: 'skattekort', label: da.detailPage.sections.taxCard },
    { id: 'ferie', label: da.detailPage.sections.holiday },
];

function OverviewTab({ employee }: { employee: Employee }) {
    const [activeId, setActiveId] = useState(SECTIONS[0].id);

    useEffect(() => {
        const ids = SECTIONS.map((s) => s.id);
        const observer = new IntersectionObserver(
            (entries) => {
                // Pick the section whose top is closest to the viewport top.
                const visible = entries.filter((e) => e.isIntersecting);
                if (visible.length === 0) return;
                visible.sort(
                    (a, b) =>
                        a.boundingClientRect.top - b.boundingClientRect.top,
                );
                const top = visible[0];
                if (top) setActiveId(top.target.id);
            },
            // Anchor activates when the section's top is within the middle
            // 40% of the viewport so the highlight moves smoothly as the
            // user scrolls.
            { rootMargin: '-20% 0px -50% 0px', threshold: 0 },
        );
        for (const id of ids) {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
        }
        return () => observer.disconnect();
    }, []);

    const handleJump = (id: string) => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setActiveId(id);
    };

    return (
        <div className="flex gap-8 pt-5 items-start">
            <div className="flex-1 min-w-0 flex flex-col gap-4">
                <PersonalInfoSection employee={employee} />
                <div className="grid grid-cols-2 gap-4">
                    <PaymentSection employee={employee} />
                    <TaxCardSection />
                </div>
                <HolidaySection />
            </div>
            <aside className="w-44 shrink-0">
                <AnchorNav
                    sections={SECTIONS}
                    activeId={activeId}
                    onJump={handleJump}
                />
            </aside>
        </div>
    );
}

// --- Page ----------------------------------------------------------------

export function EmployeeDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const variantPaths = useVariantPaths();
    const employees = useEmployees();
    const employee = employees.find((e) => e.id === id);
    const backToList = `${variantPaths.employees}?state=processed`;

    const stats = useMemo(() => {
        if (!employee) return null;
        return da.detailPage.stats;
    }, [employee]);

    if (!employee || !stats) {
        return (
            <div className="flex flex-col gap-4">
                <button
                    type="button"
                    onClick={() => navigate(backToList)}
                    className="inline-flex items-center gap-1 text-sm text-blue-500 hover:underline self-start"
                >
                    <Icon name="chevron-left" />
                    {da.detailPage.back}
                </button>
                <Alert state="warning" title="Medarbejder ikke fundet">
                    Gå tilbage til listen og åbn en medarbejder igen.
                </Alert>
            </div>
        );
    }

    const tabs = da.detailPage.overviewTabs;

    return (
        <div className="flex flex-col gap-6">
            <Button appearance="discrete" onClick={() => navigate(backToList)}>
                <Icon name="chevron-left" />
                {da.detailPage.back}
            </Button>

            <div className="flex items-center gap-3">
                <Heading level={1}>{employee.name}</Heading>
                <Badge color={STATUS_COLOR[employee.status]} subtle>
                    {STATUS_LABEL[employee.status]}
                </Badge>
                <Button
                    appearance="default"
                    menu={(props) => (
                        <Menu {...props}>
                            <Menu.Content>
                                <Menu.Item disabled>
                                    {da.actions.morePlaceholder}
                                </Menu.Item>
                            </Menu.Content>
                        </Menu>
                    )}
                >
                    {da.detailPage.actions}
                </Button>
            </div>

            <div className="flex items-stretch gap-3">
                <StatCard title={stats.hours} value={`0,00 ${stats.hoursUnit}`} />
                <StatCard
                    title={stats.remainingVacation}
                    value={`0,00 ${stats.remainingVacationUnit}`}
                    subtitle={stats.payDuringVacation}
                />
                <StatCard title={stats.payPeriod} value={stats.payPeriodValue} />
                <StatCard
                    title={stats.nextPayment}
                    value={stats.nextPaymentValue}
                    subtitle={stats.nextPaymentSubtitle}
                />
                <GrossYtdCard />
            </div>

            <Tabs defaultId="balances">
                <Tabs.List>
                    <Tabs.Trigger id="balances">{tabs.balances}</Tabs.Trigger>
                    <Tabs.Trigger id="holiday-savings">
                        {tabs.holidaySavings}
                    </Tabs.Trigger>
                    <Tabs.Trigger id="pay-history">
                        {tabs.payHistory}
                    </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content id="balances">
                    <BalancesTab />
                </Tabs.Content>
                <Tabs.Content id="holiday-savings">
                    <VacationSavingsTab />
                </Tabs.Content>
                <Tabs.Content id="pay-history">
                    <PayHistoryTab />
                </Tabs.Content>
            </Tabs>
        </div>
    );
}
