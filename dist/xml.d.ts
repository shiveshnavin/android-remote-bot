export interface Node {
    $?: {
        index: string;
        text: string;
        'resource-id': string;
        class: string;
        package: string;
        'content-desc': string;
        checkable: string;
        checked: string;
        clickable: string;
        enabled: string;
        focusable: string;
        focused: string;
        scrollable: string;
        'long-clickable': string;
        password: string;
        selected: string;
        bounds: string;
    };
    node?: Node[];
}
declare class XmlUtils {
    private xmlString?;
    xmlJson: any | null;
    constructor(xmlString?: string);
    parseXml(xmlString?: string): Promise<any>;
    findNodeByLabel(label: string): Promise<Node | null>;
    findNodeByAttr(attr: string, attrValue: string): Promise<Node | null>;
    getBounds(node: Node): {
        x: number;
        y: number;
    } | null;
}
export { XmlUtils };
