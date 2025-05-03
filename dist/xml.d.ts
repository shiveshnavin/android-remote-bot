interface Node {
    $?: {
        [key: string]: string;
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
