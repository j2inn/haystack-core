<p align="center">
  <a href="https://github.com/j2inn/haystack-core/actions/workflows/master-push.yaml">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/j2inn/haystack-core/Master%20push" />
  </a>

  <a href="https://github.com/j2inn/haystack-core/blob/master/LICENSE">
    <img alt="GitHub" src="https://img.shields.io/github/license/j2inn/haystack-core" />
	</a>
</p>

# Haystack Core

A core [haystack](https://project-haystack.org/) implementation written in TypeScript.

-   Core haystack type implementation.
-   Haystack filter compilation and evaluation.
-   Core haystack units implementation.
-   [Hayson](https://github.com/j2inn/hayson) encoding/decoding.
-   [Zinc 3.0](https://project-haystack.org/doc/Zinc) encoding/decoding.
-   [Haystack v4 defs](https://project-haystack.dev/doc/docHaystack/Defs) full normalization, namespace and filter support.

This library is designed to be used in conjunction with these other haystack libraries depending on your use case...

-   [Haystack units](https://github.com/j2inn/haystack-units): all haystack units.
-   [Haystack nclient](https://github.com/j2inn/haystack-nclient): a client network library used for working with a haystack server.
-   [Haystack react](https://github.com/j2inn/haystack-react): a set of high level [React](https://reactjs.org/) hooks and utilities for working with haystack data.

## Installation

```
npm install haystack-core
```

## APIs

Please click [here](http://j2-docs.s3-website-us-east-1.amazonaws.com/j2inn/haystack-core/index.html) for the API documentation.

### Core Types

The following core Haystack types are implemented...

-   HVal: the base class for all haystack values.
-   HStr: a string value.
-   HBool: a boolean true or false value.
-   HNum: a numeric value.
-   HCoord: co-ordinates with latitude and longitude.
-   HXStr: an xstring implementation. Supports difference types and mime types.
-   HDate: a date value.
-   HTime: a time value.
-   HDateTime: date and time.
-   HSymbol: a symbol.
-   HDict: dictionary - a map of key/haystack value pairs.
-   HGrid: grid - a table of haystack values.
-   HList: a list of haystack values.
-   HMarker: a marker value.
-   HNa: a non-applicable value.
-   HRef: a reference value.
-   HRemove: a remove value.
-   HUri: a universal resource indicator value.

Each haystack value has a kind that can be queried. A haystack value can be encoded to Zinc by calling `toZinc()`.

To convert a Zinc back to a haystack value see `ZincReader`.

### Units

Haystack core has full support for [units](https://project-haystack.org/doc/Units). The actual unit database implementation is stored in [haystack-units](https://github.com/j2inn/haystack-units). This enables a developer to import the whole unit database or just the units they're interested in working in.

### Defs

Haystack core has comprehensive support for [Haystack v4 defs](https://project-haystack.dev/doc/docHaystack/Defs). Defs add an ontology to the pre-existing haystack taxonomy that is now formalized.

-   Normalization: compile a number of libraries (typically held in a trio format) into a normalized def database that can be consumed by a namespace.
-   Namespace: the defs database that can be queried.
-   Filter: extra haystack filter support for making semantic queries using defs.

### Trio

The `TrioReader` and `TrioWriter` classes are used to read and write Trio files.

### Hayson

[Hayson](https://github.com/j2inn/hayson) is an alternative JSON encoding format for Haystack that's being promoted.

Hayson has full support in Haystack Core.

### Shorthand

An abbreviated namespace of useful methods has been created to make it easier to work with in environments such as a web browser.

### Filters

A full [haystack filter](https://project-haystack.org/doc/Filters) compiler implementation is included.

To work with filters please see HFilter.

-   Compile a haystack filter into a node AST (abstract syntax tree).
-   Evaluate a Haystack Filter against some haystack values.
-   Convert an AST Node tree back into a haystack filter.
-   Build a filter using `HFilterBuilder`

#### Design

##### Grammar

For the full grammar, please see the class definition for the Parser.

The main class to work with is HFilter. This class contains a number of high level methods that hide the complexity of working with the underlying parser.

##### Nodes

When a haystack filter string is parsed, it's converted into an AST (abstract syntax tree) hierarchy of Nodes.

The Node tree can be used in the following ways...

-   Locally evaluated against some data to see if the filter matches or not.
-   Converted to back into a haystack filter string.
-   Modified via the relevant accessor methods for each different type of Node.
-   Revalidated to ensure any changes to the Node tree doesn't contain errors.

##### Visitors

The [visitor design pattern](https://en.wikipedia.org/wiki/Visitor_pattern) has been implemented to make it easy to generate code for different targets (i.e. a haystack filter string).

##### LocalizedError

Any errors caught during parsing are thrown as LocalizedError objects. This error object contains a lexicon key and arguments used for localization as well as a possible index number. If the index number is defined, it will specify the index number of the character that caused the error in the original haystack filter.

# Misc links

-   [Haystack zinc](https://project-haystack.org/doc/Zinc)
-   [Haystack filters](https://project-haystack.org/doc/Filters)
-   [Java Haystack Filter implemenation](https://github.com/skyfoundry/haystack-java)
