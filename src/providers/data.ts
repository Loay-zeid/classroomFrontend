import { createDataProvider } from "@refinedev/rest";
import type { CreateDataProviderOptions } from "@refinedev/rest";
import type { HttpError } from "@refinedev/core";
import { BACKEND_BASE_URL } from "@/constence";
import {CreateResponse, GetOneResponse, ListResponse, Subject} from "@/types";


type SubjectApiRow = {
    id: number;
    name: string;
    code?: string;
    description?: string;
    courseCode?: string;
    briefDescription?: string;
    department?: unknown;
    departments?: unknown;
    created_at?: string;
    createdAt?: string;
};

const toDepartmentName = (value: unknown): string => {
    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object" && value !== null) {
        const candidate = value as {
            name?: unknown;
            title?: unknown;
            label?: unknown;
            department?: unknown;
        };

        if (typeof candidate.name === "string") return candidate.name;
        if (typeof candidate.title === "string") return candidate.title;
        if (typeof candidate.label === "string") return candidate.label;
        if (typeof candidate.department === "string") return candidate.department;
    }

    return "";
};

const mapSubject = (row: SubjectApiRow): Subject => ({
    id: row.id,
    name: row.name,
    courseCode: row.courseCode ?? row.code ?? "",
    briefDescription: row.briefDescription ?? row.description ?? "",
    department: (toDepartmentName(row.department) || toDepartmentName(row.departments) || "") as Subject["department"],
    createdAt: row.createdAt ?? row.created_at,
});

const buildHttpError = async (response: Response): Promise<HttpError> => {
    let message = "Request failed";

    try {
        const payload = (await response.json()) as {message?:string};

    if (payload?.message) message = payload.message;
    } catch {
        // Keep default message when body parsing fails.
    }

    return {
        message,
        statusCode: response.status,
    };
};

const options: CreateDataProviderOptions = {
    getList: {
        getEndpoint: ({ resource }) => resource,

        buildQueryParams: async ({ resource, pagination, filters }) => {
            const page = pagination?.currentPage ?? 1;
            const pageSize = pagination?.pageSize ?? 10;

            const params: Record<string, string | number> = { page, limit: pageSize };

            filters?.forEach((filter) => {
                const field = 'field' in filter ? filter.field : '';
                const value = String(filter.value);

                if (resource === 'subjects') {
                    if (field === 'department') params.department = value;
                    if (field === 'name' || field === 'code') params.search = value;
                }

                if (resource === 'classes') {
                    if (field === 'name') params.search = value;
                    if (field === 'subject') params.subject = value;
                    if (field === 'teacher') params.teacher = value;
                }
            });

            return params;
        },


        mapResponse: async (response: Response, params) => {
            if (!response.ok) {
                throw await buildHttpError(response);
            }
            const payload: ListResponse<SubjectApiRow> = await response.clone().json();
            if (params.resource === "subjects") {
                return (payload.data ?? []).map(mapSubject);
            }
            return payload.data ?? [];
        },
        getTotalCount: async (response: Response) => {
            if (!response.ok) {
                throw await buildHttpError(response);
            }

            const payload: ListResponse<SubjectApiRow> & {
                pagination?: { total?: number; totalCount?: number };
            } = await response.clone().json();

            return (
                payload.pagination?.total ??
                payload.pagination?.totalCount ??
                payload.data?.length ??
                0
            );
        },
    },
    create: {
        getEndpoint: ({ resource }) => resource,
        buildBodyParams: async ({ variables }) => variables,
        mapResponse: async (response: Response) => {
            if (!response.ok) {
                throw await buildHttpError(response);
            }
            const payload: CreateResponse = await response.json();
            return payload.data ?? {};
        },
    },
    getOne: {
        getEndpoint: ({ resource, id }) => `${resource}/${id}`,
        mapResponse: async (response) => {
            if (!response.ok) {
                throw await buildHttpError(response);
            }
            const json: GetOneResponse = await response.json();
            return json.data ?? {};
        },
    },
};



const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };
