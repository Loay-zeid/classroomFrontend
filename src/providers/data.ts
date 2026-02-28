import { createDataProvider } from "@refinedev/rest";
import type { CreateDataProviderOptions } from "@refinedev/rest";
import { BACKEND_BASE_URL } from "@/constence";
import { ListResponse, Subject } from "@/types";


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

const mapSubject = (row: SubjectApiRow): Subject => ({
    id: row.id,
    name: row.name,
    courseCode: row.courseCode ?? row.code ?? "",
    briefDescription: row.briefDescription ?? row.description ?? "",
    department:
        typeof row.department === "object" &&
        row.department !== null &&
        "name" in row.department &&
        typeof (row.department as { name?: unknown }).name === "string"
            ? ((row.department as { name: string }).name as Subject["department"])
            : typeof (row.department || row.departments || "") === "string"
                ? ((row.department || row.departments || "") as Subject["department"])
                : ("" as Subject["department"]),
    createdAt: row.createdAt ?? row.created_at,
});

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
            });

            return params;
        },


        mapResponse: async (response: Response) => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }

            const payload: ListResponse<SubjectApiRow> = await response.clone().json();
            return (payload.data ?? []).map(mapSubject);
        },
        getTotalCount: async (response: Response) => {
            if (!response.ok) {
                return 0;
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
};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };
