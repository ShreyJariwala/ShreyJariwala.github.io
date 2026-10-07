import Foundation
import SwiftData
import SwiftUI
import UniformTypeIdentifiers

/// Plain-JSON snapshot of everything in the app. Works with zero accounts:
/// save it to iCloud Drive / Files / AirDrop, import it on another device.
struct Backup: Codable {
    var version: Int = 1
    var exportedAt: Date = .now
    var capabilities: [CapabilityDTO] = []
    var pacts: [PactDTO] = []

    struct CapabilityDTO: Codable {
        var id: UUID
        var name: String
        var why: String
        var target: String
        var level: String
        var createdAt: Date
        // Optional so older backups still import.
        var question: String?
        var askedAt: Date?
        var practicingAt: Date?
        var proficientAt: Date?
        var teachingAt: Date?
    }

    struct CheckInDTO: Codable {
        var id: UUID
        var day: Date
        var didIt: Bool
        var value: Double?
        var note: String
        var missReason: String
    }

    struct OutputDTO: Codable {
        var id: UUID
        var date: Date
        var title: String
        var detail: String
        var kind: String
        var link: String
        var isOperationalized: Bool
        var operationalNote: String
    }

    struct PactDTO: Codable {
        var id: UUID
        var action: String
        var question: String
        var durationDays: Int
        var startDate: Date
        var metricName: String
        var status: String
        var decision: String
        var plus: String
        var minus: String
        var nextStep: String
        var routine: String
        var operationalizedAt: Date?
        var pivotedFromID: UUID?
        var createdAt: Date
        var capabilityID: UUID?
        var checkIns: [CheckInDTO]
        var outputs: [OutputDTO]
    }
}

enum BackupService {
    static func encoder() -> JSONEncoder {
        let e = JSONEncoder()
        e.dateEncodingStrategy = .iso8601
        e.outputFormatting = [.prettyPrinted, .sortedKeys]
        return e
    }

    static func decoder() -> JSONDecoder {
        let d = JSONDecoder()
        d.dateDecodingStrategy = .iso8601
        return d
    }

    static func export(from context: ModelContext) throws -> Data {
        let capabilities = try context.fetch(FetchDescriptor<Capability>())
        let pacts = try context.fetch(FetchDescriptor<Pact>())

        var backup = Backup()
        backup.capabilities = capabilities.map {
            Backup.CapabilityDTO(id: $0.id, name: $0.name, why: $0.why, target: $0.target,
                  level: $0.levelRaw, createdAt: $0.createdAt, question: $0.question, askedAt: $0.askedAt,
                  practicingAt: $0.practicingAt, proficientAt: $0.proficientAt, teachingAt: $0.teachingAt)
        }
        backup.pacts = pacts.map { p in
            Backup.PactDTO(id: p.id, action: p.action, question: p.question, durationDays: p.durationDays,
                  startDate: p.startDate, metricName: p.metricName, status: p.statusRaw,
                  decision: p.decisionRaw, plus: p.plus, minus: p.minus, nextStep: p.nextStep,
                  routine: p.routine, operationalizedAt: p.operationalizedAt,
                  pivotedFromID: p.pivotedFromID, createdAt: p.createdAt,
                  capabilityID: p.capability?.id,
                  checkIns: p.sortedCheckIns.map {
                      Backup.CheckInDTO(id: $0.id, day: $0.day, didIt: $0.didIt, value: $0.value,
                            note: $0.note, missReason: $0.missReasonRaw)
                  },
                  outputs: p.sortedOutputs.map {
                      Backup.OutputDTO(id: $0.id, date: $0.date, title: $0.title, detail: $0.detail,
                            kind: $0.kindRaw, link: $0.link,
                            isOperationalized: $0.isOperationalized,
                            operationalNote: $0.operationalNote)
                  })
        }
        return try encoder().encode(backup)
    }

    /// Merge a backup into the store. Items whose id already exists are skipped,
    /// so importing the same file twice is harmless.
    @discardableResult
    static func importData(_ data: Data, into context: ModelContext) throws -> (pacts: Int, capabilities: Int) {
        let backup = try decoder().decode(Backup.self, from: data)

        var capabilitiesByID: [UUID: Capability] = [:]
        for c in try context.fetch(FetchDescriptor<Capability>()) { capabilitiesByID[c.id] = c }
        let existingPactIDs = try Set(context.fetch(FetchDescriptor<Pact>()).map(\.id))

        var newCapabilities = 0
        for dto in backup.capabilities where capabilitiesByID[dto.id] == nil {
            let c = Capability(name: dto.name, why: dto.why)
            c.id = dto.id
            c.target = dto.target
            c.levelRaw = dto.level
            c.createdAt = dto.createdAt
            c.question = dto.question ?? ""
            c.askedAt = dto.askedAt
            c.practicingAt = dto.practicingAt
            c.proficientAt = dto.proficientAt
            c.teachingAt = dto.teachingAt
            context.insert(c)
            capabilitiesByID[dto.id] = c
            newCapabilities += 1
        }

        var newPacts = 0
        for dto in backup.pacts where !existingPactIDs.contains(dto.id) {
            let p = Pact(action: dto.action, question: dto.question, durationDays: dto.durationDays,
                         startDate: dto.startDate, metricName: dto.metricName)
            p.id = dto.id
            p.statusRaw = dto.status
            p.decisionRaw = dto.decision
            p.plus = dto.plus
            p.minus = dto.minus
            p.nextStep = dto.nextStep
            p.routine = dto.routine
            p.operationalizedAt = dto.operationalizedAt
            p.pivotedFromID = dto.pivotedFromID
            p.createdAt = dto.createdAt
            context.insert(p)
            if let cid = dto.capabilityID { p.capability = capabilitiesByID[cid] }

            for c in dto.checkIns {
                let entry = CheckIn(day: c.day, didIt: c.didIt)
                entry.id = c.id
                entry.value = c.value
                entry.note = c.note
                entry.missReasonRaw = c.missReason
                context.insert(entry)
                entry.pact = p
            }
            for o in dto.outputs {
                let out = LabOutput(title: o.title)
                out.id = o.id
                out.date = o.date
                out.detail = o.detail
                out.kindRaw = o.kind
                out.link = o.link
                out.isOperationalized = o.isOperationalized
                out.operationalNote = o.operationalNote
                context.insert(out)
                out.pact = p
            }
            newPacts += 1
        }
        try context.save()
        return (newPacts, newCapabilities)
    }
}

/// Wrapper so SwiftUI's `.fileExporter` can write the JSON.
struct BackupDocument: FileDocument {
    static var readableContentTypes: [UTType] { [.json] }
    var data: Data

    init(data: Data) { self.data = data }

    init(configuration: ReadConfiguration) throws {
        data = configuration.file.regularFileContents ?? Data()
    }

    func fileWrapper(configuration: WriteConfiguration) throws -> FileWrapper {
        FileWrapper(regularFileWithContents: data)
    }
}
