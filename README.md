# OCI Kinetic Infrastructure Toolkit [0.2.0](#version-0.2.0)

OCI Kinetic Infrastructure Toolkit (OKIT) provides a number of tools that will allow full project integration from 
Architects to Development and on to Operations.

The Web based interface will allow architects and designers to build a visual representation of the required infrastructure
with the customer and then export it as svg for inclusion in customer documentation. In addition they have the ability to 
quickly generate DevOp scripts (terraform / ansible) that can be used to rapidly proto-type the environment they are building.
Once built diagrams can be saved to a transportable json format that can subsequently be loaded or passed through the 
terraform/ansible generation tool.

Using the toolkit the Operations user will be able to capture existing OCI environments, through simple command line or the 
web interface, to provide a portable generic, json, file that can be used to visualise existing systems or generate terraform/ansible. 


## Table of Contents

1. [Artifact Support Matrix](#artifact-support-matrix)
2. [Installation](#installation)
3. [Usage](#usage)
    1. [Currently Implemented Artifacts](#currently-implemented-artifacts)
    2. [Prerequisites](#prerequisites)
    3. [Web Interface](#web-interface)
    4. [Command Line](#command-line)
4. [Examples](#examples)
5. [Issues](#issues)
6. [Development](#development)
7. [3rd Party Libraries](#3rd-party-libraries)
8. [Artifact Support Matrix Gap Analysis](#artifact-support-matrix-gap-analysis)
9. [Release Notes](#release-notes)


## Artifact Support Matrix
All Released Arifacts support the **Required** parameters allowing there creation through Terraform / Ansible and query 
using the oci python API.
 
Where functionality is missing it will be associated with **Optional** parameters.

The table below lists a summary of the current support status whilst the details can be found at the end of the document.

| Artifact                | Support | Version | Gaps |
| ----------------------- | ------- | ------- | ---- |
| **Containers**
| Compartment             | Full    | 0.2.0   | 
| **Network**
| Route Table             | Partial | 0.1.0   | [1](#route-table)
| Security List           | Partial | 0.1.0   | [3](#security-list)
| Subnet                  | Partial | 0.1.0   | [2](#subnet)
| Virtual Cloud Network   | Partial | 0.1.0   | [1](#virtual-cloud-network)
| **Gateways**
| Dynamic Routing Gateway | Partial | 0.1.0   | [2](#dynamic-routing-gateway)
| Internet Gateway        | Full    | 0.2.0   | 
| Local Peering Gateway   | Full    | 0.2.0   | 
| NAT Gateway             | Full    | 0.2.0   | 
| Service Gateway         | Partial | 0.1.0   | [1](#service-gateway)
| **Storage**
| Block Storage Volume    | Partial | 0.1.0   | [3](#block-storage-volume)
| File Storage System     | Partial | 0.1.0   | [5](#file-storage-system)
| Object Storage Bucket   | Partial | 0.1.0   | [3](#object-storage-bucket)
| **Database**
| Autonomous Database     | Partial | 0.1.0   | [2](#autonomous-database)
| **Compute**
| Instance                | Partial | 0.1.0   | [5](#instance)
| Load Balancer           | Partial | 0.1.0   | [2](#load-balancer)


## Installation
The OKIT Installation steps can be found in the [OCI Kinetic Infrastructure Toolkit Installation Guide](documentation/Installation.md).


## Usage
The OKIT User / Usage Guide and worked examples can be found in the [OCI Kinetic Infrastructure Toolkit Usage Guide](documentation/Usage.md)


## Issues
Any issues found with the tool should be raised on the repositories issues page. Please check that this has not previously
been reported. 


## Development
If you would like to extend OKIT the development process is documented in [OCI Kinetic Infrastructure Toolkit Development Guide](documentation/Development.md)


## 3rd Party Libraries
### Javascript

| Library    | Version | License   | Sub Type   | Home Page                                               |
| ---------- | ------- | --------- | ---------- | ------------------------------------------------------- |
| jQuery     | 3.4.1   | MIT       | Expat      | [JQuery License](https://jquery.org/license/)           |
| d3         | 5.15    | BSD       | 3-Clause   | [d3](https://d3js.org/)                                 |

### Python

| Library      | Version | License      | Sub Type   | Home Page                                                       |
| ------------ | ------- | ------------ | ---------- | --------------------------------------------------------------- |
| flask        | 1.1.1   | BSD          | 3-Clause   | [PyPi Flask](https://pypi.org/project/Flask/)                   |
| gunicorn     | 20.0.4  | MIT          |            | [PyPi gunicorn](https://pypi.org/project/gunicorn/)             |
| itsdangerous | 1.1.0   | BSD          | 3-Clause   | [PyPi ItsDangerous](https://pypi.org/project/itsdangerous/)     |
| jinja2       | 2.10.3  | BSD          | 3-Clause   | [PyPi Jinja2](https://pypi.org/project/Jinja2/)                 |
| markupsafe   | 1.1.1   | BSD          | 3-Clause   | [PyPi markupSafe](https://pypi.org/project/MarkupSafe/)         |
| oci          | 2.6.0   | UPL / Apache | OSI        | [PyPi PyYAML](https://pypi.org/project/oci/)                 |
| pyyaml       | 5.3     | MIT          |            | [PyPi PyYAML](https://pypi.org/project/PyYAML/)                 |
| werkzeug     | 0.16.0  | BSD          | 3-Clause   | [PyPi Werkzeug](https://pypi.org/project/Werkzeug/)             |


## Artifact Support Matrix Gap Analysis

#### Containers

#### Network
##### Route Table
- Destination Type of CIDR_BLOCK is the only supported option.
##### Security List
- TCP Options - Current just uses default
- UDP Options - Current just uses default
- ICMP Options - Current just uses default
##### Subnet
- ipV6 Functionality but this is currently only available for Government domains.
- Availability Domain we assume that we always use the recommended Regional Subnets.
##### Virtual Cloud Network
- ipV6 Functionality but this is currently only available for Government domains.

#### Gateways
##### Service Gateway
- Route Table Selection

#### Storage
##### Block Storage Volume
- Key Management / Encryption
- VPUs
- Source Information for creation from backup.
##### File Storage System
- Key Management / Encryption
- Min / Max Size
- Anonymous GID/UID
- Identity Squash
- Privileged Source Port
##### Object Storage Bucket
- Key Management / Encryption
- Metadata
- Events

#### Database
##### Autonomous Database
- Cloning (Includes all cloning functionality / Referencing)
- BYOL

#### Compute
##### Instance
- Agent Config
- Fault Domain (Unable To specify)
- Existing Boot Volume can not be specified.
- Launch Options
- PV Encryption
##### Load Balancer
- Network Security Group
- IPv6 (Only Government)


## Release Notes

### Version 0.2.0 
**Release Date**: 6th March 2020
#### Features
1. Save As Template
2. Sub Compartments
3. Freeform Tags
4. Defined Tags - Assumes the user types the names correctly.
5. Fully Supported Artifacts
    1. Compartments
    2. Route Table
    3. Internet Gateways
    4. NAT Gateways
    5. Local Peering Gateways
#### Bug Fixes
1. Terraform creation failed when the subnet was not attached to a Route Table.
2. Unattached DRGs caused the display of the JSON to fail.

### Version 0.1.0
**Release Date**: 6th February 2020

Initial internal release providing a number of basic functionality with required properties. This release allows for the 
drawing of infrastructure, generation of Ansible & Terraform for the implemented artifacts and the querying of multiple
regions to generate diagrams representing implemented infrastructure.
#### Features
1. Infrastructure Creation Web Interface
    1. Compartment
    2. Virtual Cloud Networks
    3. Subnets
    4. Instances
    5. Load Balancers
    6. Internet Gateways
    7. NAT Gateways
    8. Local Peering Gateways
    9. Block Storage
    10. Object Storage
    11. File Storage
    12. Autonomous Database
    13. Service Gateway
2. Ansible Script Generation
3. Terraform Script Generation
4. Export to Resource Manager
5. Multi Regional Query of implemented Artifacts
6. File (Diagram) Management
    1. New
    2. Save
    3. Load
