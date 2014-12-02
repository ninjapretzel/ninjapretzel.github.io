<?xml version="1.0" encoding="UTF-7"?>

<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:template match="/">
		<html>
			<head>
				<title>XLST Assignment: Apartments to Rent</title>
			</head>
			<body>
			<h1>Apartments to Rent</h1>
			<hr />
			<xsl:apply-templates />
			</body>
		</html>
	</xsl:template>
	
	<xsl:template match="property">
		<xsl:apply-templates />
		<hr />	
	</xsl:template>
	
	
	<xsl:template match="address">
		<h2 align="center">
			<xsl:value-of select="@number" /><xsl:text> </xsl:text>
			<xsl:value-of select="@street" />
			<xsl:if test="(@unit)">
				<xsl:text>, Unit </xsl:text>
				<xsl:value-of select="@unit" />
			</xsl:if>
			<br />
			<xsl:value-of select="@city" /><xsl:text>, </xsl:text>
			<xsl:value-of select="@state" /><xsl:text> </xsl:text>
			<xsl:value-of select="@zip" />
		</h2>
	</xsl:template>
	
	<xsl:template match="description">
		<h3>Features of this Property:</h3>
		<table border="3">
			<thead ncols="7">
				<td>Bedrooms</td>
				<td>Bathrooms</td>
				<td>Sq. Ft.</td>
				<td>Parking Spots</td>
				<td>Pets Allowed</td>
				<td>Washer/Dryer Included</td>
			</thead>
			<tbody>
				<td align="center"><xsl:value-of select="@nbeds" /></td>
				<td align="center"><xsl:value-of select="@nbaths" /></td>
				<td align="center"><xsl:value-of select="@sqft" /></td>
				<td align="center"><xsl:value-of select="@nparking_spots" /></td>
				<td align="center"><xsl:value-of select="@pet" /></td>
				<td align="center"><xsl:value-of select="@washer_drier" /></td>
			</tbody>
		</table>
	</xsl:template>
	
	<xsl:template match="application_process">
		<h3>The Application Process</h3>
		<ol>
			<xsl:apply-templates />
		</ol>
	</xsl:template>
	
	<xsl:template match="step">
		<li>
			<!-- . means current node, like a directory path-->
			<xsl:value-of select="." />
		</li>
	</xsl:template>
	
	<xsl:template match="comments">
		<h3>Comments</h3>
		<p>
			<xsl:value-of select="." />
		</p>
	</xsl:template>
	
</xsl:stylesheet>





























