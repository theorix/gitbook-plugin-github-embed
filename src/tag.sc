import java.time.LocalDateTime
import java.io.PrintWriter
import java.io.File
import scala.io.Source
import java.io.BufferedInputStream
import java.io.FileInputStream
import scala.language.postfixOps
@main def exec(repo: String, className: String, functionName: String) = {
   workspace.openProject(repo)
   var lineDelimiter = "__LANYING_CODE_SNAPPET_LINE_DELIMITER__"
   var fieldDelimiter = "__LANYING_CODE_SNAPPET_FIELD_DELIMITER__"
   var rule = "[^\\n=]*%s.%s\\(.*".format(className, functionName)
   if (className == ""){
      rule = "[^\\n=]*%s\\(.*".format(functionName)
   }
   cpg.call.code(rule).foreach(r => {
    printf("CodeSnippet%s%s%s%s%s%s%s%s%s%s\n", fieldDelimiter, r.inAst.isMethod.toList(0).filename, fieldDelimiter, r.lineNumber.getOrElse(),fieldDelimiter, r.inAst.isBlock.toList(0).code.replaceAll("\n",lineDelimiter), fieldDelimiter, project.projectFile.inputPath, fieldDelimiter, r.inAst.isBlock.toList(0).lineNumber.getOrElse())
   })
}
