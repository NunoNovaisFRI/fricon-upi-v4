/**
 * Repository Interface (documentation only)
 *
 * This file documents the public API expected from repositories in the
 * application. Implementations (like MovementRepository) should follow this
 * contract.
 *
 * Methods:
 *  - load(records)
 *  - clear()
 *  - count()
 *  - exists()
 *  - findAll()
 *  - findByDate(date)
 *  - findBetweenDates(start,end)
 *  - findByOperator(operator)
 *  - findByArticle(articleCode)
 *  - findByArticleName(articleName)
 *  - findByWarehouse(warehouse)
 *  - findByZone(zone)
 *  - findByShelf(shelf)
 *  - findByMovementType(type)
 *  - findByDocument(document)
 *  - findByBatch(batch)
 *  - findByDepartment(department)
 *  - findByBarcode(barcode)
 *
 * Aggregations:
 *  - groupByOperator()
 *  - groupByArticle()
 *  - groupByZone()
 *  - groupByWarehouse()
 *  - groupByShelf()
 *  - groupByDepartment()
 *  - groupByMovementType()
 *
 * Statistics:
 *  - getStatistics()
 *
 * Top lists:
 *  - topArticles(limit)
 *  - topOperators(limit)
 *  - topZones(limit)
 *  - topWarehouses(limit)
 *  - topShelves(limit)
 *
 * Search:
 *  - search(text)
 *
 * NOTE: This file is for developer reference and documentation. It's intentionally
 * kept as JS so it can be opened easily. It is NOT enforced at runtime.
 */

// Intentionally empty - serves as interface documentation only.
