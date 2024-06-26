let Node = function () {
    this.children = [];
    this.localMatrix = m4.identity();
    this.worldMatrix = m4.identity();
};

Node.prototype.setParent = function (parent) {
    if (this.parent) {
        let ndx = this.parent.children.indexOf(this);
        if (ndx >= 0) {
            this.parent.children.splice(ndx, 1);
        }
    }

    if (parent) {
        parent.children.push(this);
    }
    this.parent = parent;
};

Node.prototype.updateWorldMatrix = function (matrix) {
    if (matrix) {
        m4.multiply(matrix, this.localMatrix, this.worldMatrix);
    } else {
        m4.copy(this.localMatrix, this.worldMatrix);
    }

    let worldMatrix = this.worldMatrix;
    this.children.forEach(function (child) {
        child.updateWorldMatrix(worldMatrix);
    });
};


export { Node }