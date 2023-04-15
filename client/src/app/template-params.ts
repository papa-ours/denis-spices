
export interface Param {
    label?: string;
    value: any;
}

export interface TemplateParams {
    _id?: string;
    name?: Param;
    fontSize: Param;
    rowCount: Param;
    colCount: Param;
    numberOfItems: Param;
    leftPadding: Param;
    topPadding: Param;
    itemLeftDistance: Param;
    itemTopDistance: Param;
    itemWidth: Param;
    itemHeight: Param;
    imageSize: Param;
    labelWidth: Param;
    labelOffsetX: Param;
    labelOffsetY: Param;
    imageOffsetX: Param;
    imageOffsetY: Param;
    shape: Param;
    width: Param;
    height: Param;
}
