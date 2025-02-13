/*
** Copyright (c) 2020, 2022, Oracle and/or its affiliates.
** Licensed under the Universal Permissive License v 1.0 as shown at https://oss.oracle.com/licenses/upl.
*/
console.info('Loaded Designer LocalPeeringGateway View Javascript');

/*
** Define LocalPeeringGateway View Artifact Class
 */
class LocalPeeringGatewayView extends OkitDesignerArtefactView {
    constructor(artefact=null, json_view) {
        super(artefact, json_view);
    }

    get parent_id() {return this.artefact.vcn_id;}
    get parent() {return this.getJsonView().getVirtualCloudNetwork(this.parent_id);}

    /*
     ** SVG Processing
     */
    // Add Specific Mouse Events
    addAssociationHighlighting() {
        if (this.peer_id !== '') {$(jqId(this.peer_id)).addClass('highlight-association');}
        $(jqId(this.artefact_id)).addClass('highlight-association');
    }

    removeAssociationHighlighting() {
        if (this.peer_id !== '') {$(jqId(this.peer_id)).removeClass('highlight-association');}
        $(jqId(this.artefact_id)).removeClass('highlight-association');
    }
    // Draw Connections
    drawConnections() {
        if (this.peer_id !== '') {this.drawConnection(this.id, this.peer_id);}
    }

    /*
    ** Property Sheet Load function
     */
    loadProperties() {
        let okitJson = this.getOkitJson();
        let me = this;
        $(jqId(PROPERTIES_PANEL)).load("propertysheets/local_peering_gateway.html", () => {
            // Load Referenced Ids
            let route_table_select = $(jqId('route_table_id'));
            route_table_select.append($('<option>').attr('value', '').text(''));
            for (let route_table of okitJson.route_tables) {
                if (me.vcn_id === route_table.vcn_id) {
                    route_table_select.append($('<option>').attr('value', route_table.id).text(route_table.display_name));
                }
            }
            // Load Local Peering Gateways from other VCNs
            let remote_peering_gateway_select = $(jqId('peer_id'));
            remote_peering_gateway_select.append($('<option>').attr('value', '').text(''));
            for (let local_peering_gateway of okitJson.local_peering_gateways) {
                if (me.vcn_id !== local_peering_gateway.vcn_id) {
                    remote_peering_gateway_select.append($('<option>').attr('value', local_peering_gateway.id).text(local_peering_gateway.display_name));
                }
            }
            // Load Properties
            loadPropertiesSheet(me.artefact);
            $(jqId('peer_id')).on('blur', () => {okitJson.getLocalPeeringGateway(me.peer_id).peer_id = me.id;});
        });
    }

    /*
    ** Load and display Value Proposition
     */
    loadValueProposition() {
        $(jqId(VALUE_PROPOSITION_PANEL)).load("valueproposition/local_peering_gateway.html");
    }

    /*
    ** Static Functionality
     */
    static getArtifactReference() {
        return LocalPeeringGateway.getArtifactReference();
    }

    static getDropTargets() {
        return [VirtualCloudNetwork.getArtifactReference()];
    }

}
/*
** Dynamically Add View Functions
*/
OkitJsonView.prototype.dropLocalPeeringGatewayView = function(target) {
    let view_artefact = this.newLocalPeeringGateway();
    view_artefact.getArtefact().vcn_id = target.id;
    view_artefact.getArtefact().compartment_id = target.compartment_id;
    view_artefact.recalculate_dimensions = true;
    return view_artefact;
}
OkitJsonView.prototype.newLocalPeeringGateway = function(gateway) {
    this.getLocalPeeringGateways().push(gateway ? new LocalPeeringGatewayView(gateway, this) : new LocalPeeringGatewayView(this.okitjson.newLocalPeeringGateway(), this));
    return this.getLocalPeeringGateways()[this.getLocalPeeringGateways().length - 1];
}
OkitJsonView.prototype.getLocalPeeringGateways = function() {
    if (!this.local_peering_gateways) this.local_peering_gateways = []
    return this.local_peering_gateways;
}
OkitJsonView.prototype.getLocalPeeringGateway = function(id='') {
    for (let artefact of this.getLocalPeeringGateways()) {
        if (artefact.id === id) {
            return artefact;
        }
    }
    return undefined;
}
OkitJsonView.prototype.loadLocalPeeringGateways = function(local_peering_gateways) {
    for (const artefact of local_peering_gateways) {
        this.getLocalPeeringGateways().push(new LocalPeeringGatewayView(new LocalPeeringGateway(artefact, this.okitjson), this));
    }
}
