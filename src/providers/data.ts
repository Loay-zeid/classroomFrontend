import {
    CrudFilter,
    DataProvider,
    GetListParams,
    GetListResponse,
    BaseRecord,
} from "@refinedev/core";
import { Subject } from "@/types";
import { mockSubjects } from "@/mock/subjects";

const filterSubjects = (subjects: Subject[], filters?: CrudFilter[]): Subject[] => {
    if (!filters?.length) {
        return subjects;
    }

    return subjects.filter((subject) =>
        filters.every((filter) => {
            if ("field" in filter && "operator" in filter) {
                const value = subject[filter.field as keyof Subject];
                const filterValue = String(filter.value ?? "").toLowerCase();
                const currentValue = String(value ?? "").toLowerCase();

                if (filter.operator === "eq") {
                    return currentValue === filterValue;
                }

                if (filter.operator === "contains") {
                    return currentValue.includes(filterValue);
                }

                console.warn("Unsupported filter operator in subjects dataProvider", {
                    operator: filter.operator,
                    filter,
                });
                return false;
            }

            return true;
        }),
    );
};

export const dataProvider: DataProvider = {
    getList: async <
        TData extends BaseRecord = BaseRecord
    >(
        { resource, pagination, filters }: GetListParams
    ): Promise<GetListResponse<TData>> => {

        if (resource !== "subjects") {
            return {
                data: [] as TData[],
                total: 0,
            };
        }

        const filteredData = filterSubjects(mockSubjects, filters);
        const paginationState = pagination as { current?: number; pageSize?: number } | undefined;
        const current = paginationState?.current ?? 1;
        const pageSize = paginationState?.pageSize ?? 10;
        const start = (current - 1) * pageSize;
        const end = start + pageSize;

        return {
            data: filteredData.slice(start, end) as unknown as TData[],
            total: filteredData.length,
        };
    },

    getOne: async () => {
        throw new Error("Not implemented");
    },

    create: async () => {
        throw new Error("Not implemented");
    },

    update: async () => {
        throw new Error("Not implemented");
    },

    deleteOne: async () => {
        throw new Error("Not implemented");
    },

    getApiUrl: () => "",
};
