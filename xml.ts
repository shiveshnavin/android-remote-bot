import * as xml2js from "xml2js";

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
  },
  node?: Node[];
}

class XmlUtils {
  private xmlString?: string;
  public xmlJson: any | null;

  constructor(xmlString?: string) {
    this.xmlString = xmlString;
    this.xmlJson = null;
  }

  // Parse the XML string into a JavaScript object
  parseXml(xmlString?: string): Promise<any> {
    const parser = new xml2js.Parser();
    return new Promise((resolve, reject) => {
      parser.parseString(xmlString || this.xmlString, (err, result) => {
        if (err) {
          reject("Error parsing XML: " + err);
        } else {
          this.xmlJson = result;
          resolve(this.xmlJson);
        }
      });
    });
  }

  // Find the node with the given label in the 'text' attribute
  async findNodeByLabel(label: string, strict = false): Promise<Node | null> {
    // Parse the XML before searching
    if (!this.xmlJson) {
      await this.parseXml();
    }

    // Check if the root is "hierarchy" and get the nodes from there
    const root = this.xmlJson.hierarchy.node;

    // Recursive function to search through the XML
    const searchNode = (node: Node): Node | null => {
      if (!node) {
        return null
      }
      if (strict) {
        // Check if the 'text' attribute matches the label exactly
        if (node.$ && node.$.text && node.$.text === label) {
          return node;
        }
        // Check if the 'content-desc' attribute matches the label exactly
        if (node.$ && node.$['content-desc'] && node.$['content-desc'] === label) {
          return node;
        }
      }
      else {
        // Check if the 'text' attribute matches the label
        if (node.$ && node.$.text && node.$.text.includes(label)) {
          return node;
        }
        // Check if the 'content-desc' attribute matches the label
        if (node.$ && node.$['content-desc'] && node.$['content-desc'].includes(label)) {
          return node;
        }
      }

      // Recursively search through child nodes if they exist
      if (node.node) {
        for (const child of node.node) {
          const result = searchNode(child);
          if (result) return result;
        }
      }
      return null;
    };

    // Start searching through the nodes
    for (const node of root) {
      const result = searchNode(node);
      if (result) {
        return result;
      }
    }
    console.log('Node not found', `${label}`)

    return null;
  }

  // Find the node with the given attribute and value
  async findNodeByAttr(attr: string, attrValue: string, strict = false): Promise<Node | null> {
    // Parse the XML before searching
    if (!this.xmlJson) {
      await this.parseXml();
    }

    // Get root nodes from parsed XML
    const root = this.xmlJson.hierarchy.node;

    // Recursive function to search through the XML
    const searchNode = (node: Node): Node | null => {
      if (!node) {
        return null
      }
      // Check if the attribute matches the target value
      if (node.$ && node.$[attr]) {
        if (strict) {
          if (node.$[attr] === attrValue) {
            return node;
          }
        } else {
          if (node.$[attr].includes(attrValue)) {
            return node;
          }
        }
      }

      // Recursively search through children if any
      if (node.node) {
        for (const child of node.node) {
          const result = searchNode(child);
          if (result) return result;
        }
      }

      return null;
    };

    // Begin search
    for (const node of root) {
      const result = searchNode(node);
      if (result) {
        return result;
      }
    }
    console.log('Node not found', `${attr} = ${attrValue}`)
    return null;
  }

  // Get bounds of the node and return the center coordinates
  getBounds(node: Node): { x: number; y: number } | null {
    let bounds = node?.$?.bounds;
    // Example bounds format: '[403,1017][1074,1059]'
    const match = bounds?.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
    if (match) {
      const left = parseInt(match[1], 10);
      const top = parseInt(match[2], 10);
      const right = parseInt(match[3], 10);
      const bottom = parseInt(match[4], 10);

      // You can choose either the center of the bounds or a specific point, e.g., top-left corner
      const x = Math.floor((left + right) / 2); // Center X
      const y = Math.floor((top + bottom) / 2); // Center Y
      return { x, y };
    }
    return null;
  }
}

export { XmlUtils };
