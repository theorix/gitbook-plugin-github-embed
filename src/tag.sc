import java.time.LocalDateTime
import java.io.PrintWriter
import java.io.File
import scala.io.Source
import java.io.BufferedInputStream
import java.io.FileInputStream
import scala.language.postfixOps
@main def exec(repo: String, className: String, functionName: String) = {
   workspace.openProject(repo)
   var language = cpg.metaData.language.toList(0)
   var rule = ".*%s[.:->]*%s[(:]+.*".format(className, functionName)
   if (language ==  "JAVASRC") {
      cpg.call.methodFullName(rule).foreach(r => {
         var filename = r.inAst.isMethod.toList(0).filename
         var lineNumber = r.lineNumber.get
         var repoPath = project.projectFile.inputPath
         var method = r.inAst.isMethod.toList(0)
         var lineStart = method.lineNumber.get
         var lineEnd = method.lineNumberEnd.get
         if (lineEnd > lineNumber + 10) {
            lineEnd = lineNumber + 10
         }
         val lines = Source.fromFile(filename).getLines()
         var code = lines.slice(lineStart-1,lineEnd).mkString("\n")
         printResult(filename, lineNumber, code, repoPath)
      })
   } else {
      cpg.call.code(rule).foreach(r => {
         var filename = r.inAst.isMethod.toList(0).filename
         var lineNumber = r.lineNumber.get
         var repoPath = project.projectFile.inputPath
         var code = r.inAst.isBlock.toList(0).code
         printResult(filename, lineNumber, code, repoPath)
      })
   }
}

def printResult(filename: String, lineNumber: Integer, code: String, repoPath: String) = {
   var relativeFilename = filename
   if(filename.startsWith(repoPath)){
      relativeFilename = filename.substring(repoPath.length())
   }
   var lineDelimiter = "__LANYING_CODE_SNAPPET_LINE_DELIMITER__"
   var fieldDelimiter = "__LANYING_CODE_SNAPPET_FIELD_DELIMITER__"
   printf("CodeSnippet%s%s%s%d%s%s%s%s\n",
      fieldDelimiter, relativeFilename,
      fieldDelimiter, lineNumber,
      fieldDelimiter, code.replaceAll("\n",lineDelimiter),
      fieldDelimiter, repoPath)
}
