// src/interfaces/repository.interface.js

/**
 * Repository Interface (Documentation only)
 *
 * This module documents the public API expected from repositories in this project.
 * It is not enforced at runtime but serves as a reference for implementers.
 *
 * MovementRepository must implement the following methods:
 *
 * - load(records)
 * - clear()
 * - count()
 * - exists()
 * - findAll()
 * - findByDate(date)
 * - findBetweenDates(start,end)
 * - findByOperator(operator)
 * - findByArticle(articleCode)
 * - findByArticleName(articleName)
 * - findByWarehouse(warehouse)
 * - findByZone(zone)
 * - findByShelf(shelf)
 * - findByMovementType(type)
 * - findByDocument(document)
 * - findByBatch(batch)
 * - findByDepartment(department)
 * - findByBarcode(barcode)
 *
 * Aggregations:
 * - groupByOperator()
 * - groupByArticle()
 * - groupByZone()
 * - groupByWarehouse()
 * - groupByShelf()
 * - groupByDepartment()
 * - groupByMovementType()
 *
 * Statistics:
 * - getStatistics()
 *
 * Top lists:
 * - topArticles(limit)
 * - topOperators(limit)
 * - topZones(limit)
 * - topWarehouses(limit)
 * - topShelves(limit)
 *
 * Search:
 * - search(text)
 *
 */

export const RepositoryInterface = {
  // This is just documentation for the shape; no runtime enforcement.
};
