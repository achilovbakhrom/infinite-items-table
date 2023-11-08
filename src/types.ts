export type SelectorItem = {
    id: string,
    parentId: Nullable<string>
}

export type Nullable<T> = T | null

export type TableRow = {
    id: number,
    col1: Nullable<SelectorItem>,
    col2: Nullable<SelectorItem>,
    col3: Nullable<SelectorItem>,
    col4: Nullable<SelectorItem>,
    col5: Nullable<SelectorItem>,
}